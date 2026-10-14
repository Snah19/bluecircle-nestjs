// src/posts/search.module.ts

import { Module } from "@nestjs/common";
import { AuthModule } from "src/auth/auth.module";
import { SearchController } from "./search.controller";
import { SearchService } from "./search.service";

@Module({
  imports: [AuthModule],
  providers: [SearchService],
  exports: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}