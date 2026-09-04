// src/posts/posts.service.ts

import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-posts.dto';

@Injectable()
export class PostsService {
  constructor(private prismaService: PrismaService) {}

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
              favorites: true,
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
          favorites: {
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
        favorites,
        ...postFields
      } = p;

      return {
        ...postFields,
        user,
        meta: {
          totalLikes: _count.likes,
          totalReposts: _count.reposts,
          totalFavorites: _count.favorites,
          totalComments: _count.comments,
        },
        viewer: {
          isLiked: likes.length > 0,
          isReposted: reposts.length > 0,
          isFavorited: favorites.length > 0,
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
              favorites: true,
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
          favorites: {
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
        favorites,
        ...postFields
      } = p;

      return {
        ...postFields,
        user,
        meta: {
          totalLikes: _count.likes,
          totalReposts: _count.reposts,
          totalFavorites: _count.favorites,
          totalComments: _count.comments,
        },
        viewer: {
          isLiked: likes.length > 0,
          isReposted: reposts.length > 0,
          isFavorited: favorites.length > 0,
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

    const likesCount = await this.prismaService.like.count({
      where: {
        postId,
      }
    });

    return {
      isLiked: !existingLike,
      likesCount,
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

    const repostsCount = await this.prismaService.repost.count({
      where: {
        postId,
      }
    });

    return {
      isReposted: !existingRepost,
      repostsCount,
    }
  }

  async toggleFavorite(
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

    const existingFavorite = await this.prismaService.favorite.findUnique({
      where: {
        userId_postId: {
          userId: authUserId,
          postId,
        }
      }
    });

    if (existingFavorite) {
      await this.prismaService.favorite.delete({
        where: {
          id: existingFavorite.id,
        },
      });
    }
    else {
      await this.prismaService.favorite.create({
        data: {
          userId: authUserId,
          postId,
        },
      });
    }

    const favoritesCount = await this.prismaService.favorite.count({
      where: {
        postId,
      }
    });

    return {
      isFavorited: !existingFavorite,
      favoritesCount,
    }
  }

  async findComments({
    postId,
    authUserId,
    page,
    limit,
  }: {
    postId: string;
    authUserId?: string;
    page: number;
    limit: number;
  }) {
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
          createdAt: 'desc',
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
        ...commentFields
      } = c;

      return {
        ...commentFields,
        user,
        meta: {
          totalLikes: _count.likes,
          totalReplies: _count.replies,
        },
        viewer: {
          isLiked: likes.length > 0,
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
      },
    };
  }
}