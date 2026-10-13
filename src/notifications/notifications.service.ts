import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class NotificationsService {
  constructor(private prismaService: PrismaService) {}

  async findNotifications({
    authUserId,
    page,
    limit,
  }: {
    authUserId: string;
    page: number;
    limit: number;
  }) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.prismaService.notification.findMany({
        where: {
          toId: authUserId,
        },
        include: {
          from: {
            omit: {
              password: true,
            },
          },
          post: true,
          comment: {
            include: {
              repliedToComment: {
                select: {
                  user: { omit: { password: true } },
                },
              },
              parent: {
                select: {
                  user: { omit: { password: true } },
                },
              },
            },
          },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip,
        take: limit,
      }),

      this.prismaService.notification.count({
        where: {
          toId: authUserId,
        },
      }),
    ]);

    const data = notifications.map(({ from, post, comment, ...notification }) => {
      const repliedToUser =
        notification.type === "comment"
          ? (comment?.repliedToComment?.user ?? comment?.parent?.user ?? null)
          : null;

      const commentFields = comment
        ? (({ repliedToComment, parent, ...fields }) => fields)(comment)
        : null;

      return {
        id: notification.id,
        type: notification.type,
        read: notification.read,
        createdAt: notification.createdAt,
        fromUser: from,
        repliedToUser,
        post,
        comment: commentFields,
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

  async findUnreadNotifications({ authUserId }: { authUserId: string }) {
    const total = await this.prismaService.notification.count({
      where: {
        toId: authUserId,
        read: false,
      },
    });

    return { total };
  }

  async markAllNotificationsAsRead({ authUserId }: { authUserId: string }) {
    const { count } = await this.prismaService.notification.updateMany({
      where: {
        toId: authUserId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return { message: `Marked ${count} notification(s) as read` };
  }
}