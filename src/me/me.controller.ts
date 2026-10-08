import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuthUser } from "src/auth/auth-user.decorator";
import { AuthGuard } from "src/auth/auth.guard";
import { MeService } from "./me.service";
import { PaginatePostsDto } from "src/posts/dto/paginate-posts.dto";


@Controller('me')
export class MeController {
  constructor(private meService: MeService) {}

  @Get()
  @UseGuards(AuthGuard)
  findMe(@AuthUser() authUser: { id: string }) {
    return this.meService.findMe(authUser.id);
  }

  @Get('/saved-posts')
  @UseGuards(AuthGuard)
  findSavedPosts(
    @Query() query: PaginatePostsDto,
    @AuthUser() user: { id: string },
  ) {
    return this.meService.findSavedPosts({
      authUserId: user.id,
      page: query.page,
      limit: query.limit,
    });
  }
}