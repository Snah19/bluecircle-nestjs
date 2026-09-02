// src/users/users.service.ts

import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async findByUsername(
    username: string
  ) {
    const user = await this.prismaService.user.findUnique({
      where: { username },
      omit: { password: true },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async findFollowers(
    {
      username,
      authUserId,
      page,
      limit,
    }: {
      username: string,
      authUserId?: string,
      page: number,
      limit: number,
    }
  ) {
    const user = await this.prismaService.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const skip = (page - 1) * limit;

    const [followers, total] = await Promise.all([
      this.prismaService.follow.findMany({
        where: {
          followingId: user.id,
        },
        include: {
          follower: {
            omit: {
              password: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),

      this.prismaService.follow.count({
        where: {
          followingId: user.id,
        },        
      }),
    ]);

    const followerIds = followers.map((f) => f.follower.id);

    const [viewerFollowings, viewerFollowers] = authUserId && followerIds.length
      ? await Promise.all([
          this.prismaService.follow.findMany({
            where: {
              followerId: authUserId,
              followingId: {
                in: followerIds,
              },
            },
            select: {
              followerId: true,
            }
          }),

          this.prismaService.follow.findMany({
            where: {
              followerId: {
                in: followerIds,
              },
              followingId: authUserId,
            },
            select: {
              followerId: true,
            },
          }),
      ])
      : [[], []];

    const viewerFollowingSet = new Set(viewerFollowings.map((f) => f.followerId));
    const viewerFollowerSet = new Set(viewerFollowers.map((f) => f.followerId));

    const getStatus = (
      isFollowedByViewer: boolean,
      isFollowingViewer: boolean,
    ): "follow" | "following" | "follow back" | "friend" => {
      if (isFollowedByViewer && isFollowingViewer){
        return "friend";
      }
      if (isFollowedByViewer) {
        return "following";
      }
      if (isFollowingViewer) {
        return "follow back";
      }

      return "follow";
    };

    const data = followers.map((f) => {
      const isFollowedByViewer = viewerFollowingSet.has(f.follower.id);
      const isFollowingViewer = viewerFollowerSet.has(f.follower.id);

      return {
        ...f.follower,
        viewer: {
          action: getStatus(isFollowedByViewer, isFollowingViewer),
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
    }
  }

  async findPosts(
    {
      username,
      authUserId,
      page,
      limit,
    }: {
      username: string,
      authUserId?: string,
      page: number,
      limit: number,
    }
  ) {
    const user = await this.prismaService.user.findUnique({
      where: {
        username
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const viewerId = authUserId ?? "__unauthenticated__";
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prismaService.post.findMany({
        where: {
          userId: user.id,
        },
        include: {
          user: {
            omit: {
              password: true
            },
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
            where: { userId: viewerId },
            select: { id: true },
          },
          reposts: {
            where: { userId: viewerId },
            select: { id: true },
          },
          favorites: {
            where: { userId: viewerId },
            select: { id: true },
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
          userId: user.id,
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
        }
      }
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

  async findRepostedPosts(
    {
      username,
      authUserId,
      page,
      limit,
    }: {
      username: string,
      authUserId?: string,
      page: number,
      limit: number,
    }
  ) {
    const user = await this.prismaService.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const viewerId = authUserId ?? "__unauthenticated__";
    const skip = (page - 1) * limit;

    const [repostedPosts, total] = await Promise.all([
      this.prismaService.repost.findMany({
        where: {
          userId: user.id,
        },
        include: {
          post: {
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
                  favorites: true,
                  comments: true,
                },
              },
              likes: {
                where: { userId: viewerId },
                select: { id: true },
              },
              reposts: {
                where: { userId: viewerId },
                select: { id: true },
              },
              favorites: {
                where: { userId: viewerId },
                select: { id: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),

      this.prismaService.repost.count({
        where: {
          userId: user.id,
        },
      }),
    ]);

    const data = repostedPosts.map((r) => {
      const {
        _count,
        user: postUser,
        likes,
        reposts,
        favorites,
        ...postFields
      } = r.post;

      return {
        ...postFields,
        user: postUser,
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
      },
    };
  }

  async findLikedPosts(
    {
      username,
      authUserId,
      page,
      limit,
    }: {
      username: string,
      authUserId?: string,
      page: number,
      limit: number,
    }
  ) {
    const user = await this.prismaService.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    const viewerId = authUserId ?? "__unauthenticated__";
    const skip = (page - 1) * limit;

    const [likedPosts, total] = await Promise.all([
      this.prismaService.like.findMany({
        where: {
          userId: user.id,
        },
        include: {
          post: {
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
                },
              },
              favorites: {
                where: {
                  userId: user.id,
                },
                select: {
                  id: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),

      this.prismaService.like.count({
        where: {
          userId: user.id,
        }
      }),
    ]);

    const data = likedPosts.map((l) => {
      const {
        _count,
        user: postUser,
        likes,
        reposts,
        favorites,
        ...postFields
      } = l.post;

      return {
        ...postFields,
        user: postUser,
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

  async findFavoritedPosts(
    {
      username,
      authUserId,
      page,
      limit,
    }: {
      username: string,
      authUserId?: string,
      page: number,
      limit: number,
    }   
  ) {
    const user = await this.prismaService.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const viewerId = authUserId ?? "__unauthenticated__";
    const skip = (page - 1) * limit;

    const [favoritedPosts, total] = await Promise.all([
      this.prismaService.favorite.findMany({
        where: {
          userId: user.id,
        },
        include: {
          post: {
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
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),

      this.prismaService.favorite.count({
        where: {
          userId: user.id,
        },
      }),
    ]);

    const data = favoritedPosts.map((f) => {
      const {
        _count,
        user: postUser,
        likes,
        reposts,
        favorites,
        ...postFields
      } = f.post;

      return {
        ...postFields,
        user: postUser,
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
}