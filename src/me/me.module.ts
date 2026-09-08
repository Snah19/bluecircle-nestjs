import { Module } from "@nestjs/common";
import { MeService } from "./me.service";
import { MeController } from "./me.controller";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [AuthModule],
  providers: [MeService],
  exports: [MeService],
  controllers: [MeController],
})
export class MeModule {}