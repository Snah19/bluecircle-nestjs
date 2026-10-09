// src/posts/posts.service.ts

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-posts.dto';
import { CloudImagesService } from 'src/cloud-images/cloud-images.service';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    private prismaService: PrismaService,
    private cloudImagesService: CloudImagesService,
  ) {}

  async createPost(
    {
      authUserId,
      dto,
    }: {
      authUserId: string;
      dto: CreatePostDto,
    }
  ) {
    const postData = await this.prismaService.post.create({
      data: {
        userId: authUserId,
        text: dto.text ?? null,
        imageUrls: dto.imageUrls ?? [],
      },
      include: {
        user: {
          omit: {
            password: true,
          }
        }
      }
    });

    return postData;
  }

  async deletePost({
    authUserId,
    postId,
  }: {
    authUserId: string;
    postId: string;
  }) {
    const post = await this.prismaService.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        userId: true,
        imageUrls: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.userId !== authUserId) {
      throw new ForbiddenException('You are not allowed to delete this post');
    }

    await this.prismaService.post.delete({
      where: { id: postId },
    });

    try {
      await this.cloudImagesService.deleteImages(post.imageUrls);
    }
    catch (error) {
      console.error('Failed to delete images from cloud:', error);
    }

    return { message: 'Post deleted successfully' };
  }

  async updatePost({
    authUserId,
    postId,
    dto,
  }: {
    authUserId: string;
    postId: string;
    dto: UpdatePostDto;
  }) {
    const post = await this.prismaService.post.findUnique({
      where: { id: postId },
      select: { id: true, userId: true, imageUrls: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.userId !== authUserId) {
      throw new ForbiddenException('You are not allowed to update this post');
    }

    const text = dto.text?.trim() || null;
    const imageUrls = dto.imageUrls ?? [];

    if (!text && imageUrls.length === 0) {
      throw new BadRequestException('A post must have text or at least one image');
    }

    const imageUrlsToDelete = post.imageUrls.filter((url) => !imageUrls.includes(url));

    const updatedPost = await this.prismaService.post.update({
      where: { id: postId },
      data: { text, imageUrls },
      include: {
        user: {
          omit: { password: true },
        },
      },
    });

    try {
      await this.cloudImagesService.deleteImages(imageUrlsToDelete);
    }
    catch (error) {
      console.error('Failed to delete images from cloud:', error);
    }

    return updatedPost;
  }

  async findDiscoverPosts(
    {
      authUserId,
      page,
      limit,
    }: {
      authUserId?: string,
      page: number,
      limit: number,
    }
  ) {
    const viewerId = authUserId ?? "__unauthenticated__";
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prismaService.post.findMany({
        include: {
          user: {
            omit: {
              password: true,
            }
          },
          _count: {
            select: {
              likes: true,
              reposts: true,
              saves: true,
              comments: true,
            },
          },
          likes: {
            where: {
              userId: viewerId,
            },
            select: {
              id: true,
            },
          },
          reposts: {
            where: {
              userId: viewerId,
            },
            select: {
              id: true,
            }
          },
          saves: {
            where: {
              userId: viewerId,
            },
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),

      this.prismaService.post.count(),
    ]);

    const data = posts.map((p) => {
      const {
        _count,
        user,
        likes,
        reposts,
        saves,
        ...postFields
      } = p;

      return {
        ...postFields,
        user,
        meta: {
          totalLikes: _count.likes,
          totalReposts: _count.reposts,
          totalSaves: _count.saves,
          totalComments: _count.comments,
        },
        viewer: {
          isLiked: likes.length > 0,
          isReposted: reposts.length > 0,
          isSaved: saves.length > 0,
        },
      };
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      }
    }
  }

  async findFollowingPosts(
    {
      authUserId,
      page,
      limit,
    }: {
      authUserId?: string,
      page: number,
      limit: number,
    }
  ) {
    const viewerId = authUserId ?? "__unauthenticated__";
    const skip = (page - 1) * limit;

    const followings = await this.prismaService.follow.findMany({
      where: {
        followerId: viewerId,
      },
      select: {
        followingId: true,
      }
    });

    const followingIds = followings.map((f) => f.followingId);

    if (followingIds.length === 0) {
      return {
        data: [],
        meta: {
          total: 0,
          page,
          limit,
          lastPage: 0,
        }
      }
    }

    const [posts, total] = await Promise.all([
      this.prismaService.post.findMany({
        where: {
          userId: {
            in: followingIds,
          },
        },
        include: {
          user: {
            omit: {
              password: true,
            }
          },
          _count: {
            select: {
              likes: true,
              reposts: true,
              saves: true,
              comments: true,
            }
          },
          likes: {
            where: {
              userId: viewerId,
            },
            select: {
              id: true,
            }
          },
          reposts: {
            where: {
              userId: viewerId,
            },
            select: {
              id: true,
            },
          },
          saves: {
            where: {
              userId: viewerId,
            },
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),

      this.prismaService.post.count({
        where: {
          userId: {
            in: followingIds,
          }
        }
      }),
    ]);

    const data = posts.map((p) => {
      const {
        _count,
        user,
        likes,
        reposts,
        saves,
        ...postFields
      } = p;

      return {
        ...postFields,
        user,
        meta: {
          totalLikes: _count.likes,
          totalReposts: _count.reposts,
          totalSaves: _count.saves,
          totalComments: _count.comments,
        },
        viewer: {
          isLiked: likes.length > 0,
          isReposted: reposts.length > 0,
          isSaved: saves.length > 0,
        },
      };
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      }
    }
  }

  async findPostDetail({
    authUserId,
    postId,
  }: {
    authUserId?: string;
    postId: string;
  }) {
    const viewerId = authUserId ?? "__unauthenticated__";

    const post = await this.prismaService.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        user: {
          omit: {
            password: true,
          },
        },
        _count: {
          select: {
            likes: true,
            reposts: true,
            saves: true,
            comments: true,
          },
        },
        likes: {
          where: {
            userId: viewerId,
          },
          select: {
            id: true,
          },
        },
        reposts: {
          where: {
            userId: viewerId,
          },
          select: {
            id: true,
          },
        },
        saves: {
          where: {
            userId: viewerId,
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const {
      _count,
      user,
      likes,
      reposts,
      saves,
      ...postFields
    } = post;

    return {
      ...postFields,
      user,
      meta: {
        totalLikes: _count.likes,
        totalReposts: _count.reposts,
        totalSaves: _count.saves,
        totalComments: _count.comments,
      },
      viewer: {
        isLiked: likes.length > 0,
        isReposted: reposts.length > 0,
        isSaved: saves.length > 0,
      },
    };
  }

  async toggleLike(
    {
      postId,
      authUserId,
    } : {
      postId: string;
      authUserId: string;
    }
  ) {
    const post = await this.prismaService.post.findUnique({
      where: {
        id: postId,
      }
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingLike = await this.prismaService.like.findUnique({
      where: {
        userId_postId: {
          userId: authUserId,
          postId,
        }
      }
    });

    if (existingLike) {
      await this.prismaService.like.delete({
        where: {
          id: existingLike.id,
        }
      });
    }
    else {
      await this.prismaService.like.create({
        data: {
          userId: authUserId,
          postId,
        }
      });
    }

    const totalLikes = await this.prismaService.like.count({
      where: {
        postId,
      }
    });

    return {
      isLiked: !existingLike,
      totalLikes,
    }
  }

  async toggleRepost(
    {
      postId,
      authUserId,
    } : {
      postId: string;
      authUserId: string;
    }
  ) {
    const post = await this.prismaService.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingRepost = await this.prismaService.repost.findUnique({
      where: {
        userId_postId: {
          userId: authUserId,
          postId,
        }
      }
    });

    if (existingRepost) {
      await this.prismaService.repost.delete({
        where: {
          id: existingRepost.id,
        },
      });
    }
    else {
      await this.prismaService.repost.create({
        data: {
          userId: authUserId,
          postId,
        },
      });
    }

    const totalReposts = await this.prismaService.repost.count({
      where: {
        postId,
      }
    });

    return {
      isReposted: !existingRepost,
      totalReposts,
    }
  }

  async toggleSave(
    {
      postId,
      authUserId,
    } : {
      postId: string;
      authUserId: string;
    }
  ) {
    const post = await this.prismaService.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingSave = await this.prismaService.save.findUnique({
      where: {
        userId_postId: {
          userId: authUserId,
          postId,
        }
      }
    });

    if (existingSave) {
      await this.prismaService.save.delete({
        where: {
          id: existingSave.id,
        },
      });
    }
    else {
      await this.prismaService.save.create({
        data: {
          userId: authUserId,
          postId,
        },
      });
    }

    const totalSaves = await this.prismaService.save.count({
      where: {
        postId,
      }
    });

    return {
      isSaved: !existingSave,
      totalSaves,
    }
  }

  async findComments(
    {
      postId,
      authUserId,
      page,
      limit,
    }: {
      postId: string;
      authUserId?: string;
      page: number;
      limit: number;
    }
  ) {
    const viewerId = authUserId ?? "__unauthenticated__";
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      this.prismaService.comment.findMany({
        where: {
          postId,
          parentId: null,
        },
        include: {
          user: {
            omit: {
              password: true,
            },
          },
          mentionedUser: {
            omit: {
              password: true,
            },
          },
          _count: {
            select: {
              likes: true,
              replies: true,
            },
          },
          likes: {
            where: {
              userId: viewerId,
            },
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),

      this.prismaService.comment.count({
        where: {
          postId,
          parentId: null,
        },
      }),
    ]);

    const data = comments.map((c) => {
      const {
        _count,
        user,
        likes,
        mentionedUser,
        ...commentFields
      } = c;

      return {
        ...commentFields,
        user,
        mentionedUser,
        meta: {
          totalLikes: _count.likes,
          totalReplies: _count.replies,
        },
        viewer: {
          isLiked: likes.length > 0,
        }
      };
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      }
    };
  }
}