import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  logAction(userId: string, action: string, details: string) {
    return this.prisma.auditLog.create({
      data: { userId, action, details },
    });
  }
}
