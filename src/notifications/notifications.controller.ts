import { Controller, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { AuthGuard } from "src/auth/auth.guard";
import { AuthUser } from "src/auth/auth-user.decorator";
import { PaginateNotificationsDto } from "./dto/paginate-notifications.dto";

@Controller('notifications')
export class NotificationsController {
  constructor (private notificationsService: NotificationsService) {}

  @Get()
  @UseGuards(AuthGuard)
  async findNotification(
    @AuthUser() authUser: { id: string },
    @Query() dto: PaginateNotificationsDto,
  ) {
    return this.notificationsService.findNotifications({
      authUserId: authUser.id,
      ...dto,
    });
  }

  @Get("unread")
  @UseGuards(AuthGuard)
  findUnreadNotifications(
    @AuthUser() authUser: { id: string }
  ) {
    return this.notificationsService.findUnreadNotifications({
      authUserId: authUser.id,
    });
  }

  @Patch(":id/read")
  @UseGuards(AuthGuard)
  markNotificationAsRead(
    @AuthUser() authUser: { id: string },
    @Param('id') id: string,
  ) {
    return this.notificationsService.markNotificationAsRead({
      authUserId: authUser.id,
      notificationId: id,
    });
  }
}