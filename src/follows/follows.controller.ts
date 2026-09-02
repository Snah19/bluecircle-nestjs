import { Controller, Param, Post, UseGuards } from "@nestjs/common";
import { FollowsService } from "./follows.service";
import { AuthUser } from "src/auth/auth-user.decorator";
import { AuthGuard } from "src/auth/auth.guard";

@Controller("follows")
export class FollowsController {
  constructor(private followsService: FollowsService){}

  @Post("users/:userId")
  @UseGuards(AuthGuard)
  async toggleFollow(
    @AuthUser() authUser: { id: string },
    @Param('userId') userId: string,
  ) {
    return this.followsService.toggleFollow({
      followerId: authUser.id,
      followingId: userId,
    });
  }
}