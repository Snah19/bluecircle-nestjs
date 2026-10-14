import { Controller, Get, UseGuards, Query } from "@nestjs/common";
import { AuthUser } from "src/auth/auth-user.decorator";
import { OptionalAuthGuard } from "src/auth/optional-auth.guard";
import { SearchService } from "./search.service";
import { SearchDto } from "./dto/search.dto";

@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get('users')
  @UseGuards(OptionalAuthGuard)
  async searchUsers(
    @Query() dto: SearchDto,
    @AuthUser() user?: { id: string },
  ) {
    return this.searchService.searchUsers({
      authUserId: user?.id,
      ...dto,
    });
  }

  @Get('posts')
  @UseGuards(OptionalAuthGuard)
  async searchPosts(
    @Query() dto: SearchDto,
    @AuthUser() user?: { id: string },
  ) {
    return this.searchService.searchPosts({
      authUserId: user?.id,
      ...dto,
    });
  }
}