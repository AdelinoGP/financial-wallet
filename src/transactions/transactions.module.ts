import { Module } from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { TransactionsController } from "./transactions.controller";
import { PrismaService } from "src/prisma/prisma.service";
import { UsersService } from "src/users/users.service";
import { AuditService } from "src/audit/audit.service";

@Module({
  providers: [TransactionsService, PrismaService, UsersService, AuditService],
  controllers: [TransactionsController],
})
export class TransactionsModule {}
