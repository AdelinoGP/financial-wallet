import { Controller, Post, Body, Get, UseGuards, HttpStatus, BadRequestException } from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { CreateTransactionDto } from "src/transactions/transaction.dto";
import { AuthGuard } from "@nestjs/passport";
import { InternalUserModel } from "src/users/user.entity";
import { CurrentUser } from "src/decorators/currentUser.decorator";

@Controller("transactions")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @UseGuards(AuthGuard("jwt"))
  @Post()
  async create(@CurrentUser() sender: InternalUserModel, @Body() createTransactionDto: CreateTransactionDto) {
    return await this.transactionsService.createTransaction(sender, createTransactionDto);
  }

  @UseGuards(AuthGuard("jwt"))
  @Post("reverse")
  async reverse(@CurrentUser() sender: InternalUserModel, @Body("transactionId") transactionId: string) {
    if (!transactionId) {
      throw new BadRequestException({
        message: ["TransactionId is required"],
        error: "Bad Request",
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    return await this.transactionsService.reverseTransaction(sender, transactionId);
  }

  //TODO: This function only exists for debugging purposes and should be removed in production
  @UseGuards(AuthGuard("jwt"))
  @Post("add-funds")
  async addFunds(@CurrentUser() user: InternalUserModel, @Body("amount") amount: number) {
    if (!Number.isInteger(amount) || !amount || amount <= 0) {
      throw new BadRequestException({
        message: ["Amount must be greater than zero"],
        error: "Bad Request",
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    return await this.transactionsService.addFunds(user, amount);
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("user")
  async getByUser(@CurrentUser() user: InternalUserModel) {
    return await this.transactionsService.getTransactionsByUser(user);
  }

  //TODO: Set this endpoint to be used only by admin users
  @Get("id")
  async findOne(@Body("transactionId") transactionId: string) {
    if (!transactionId) {
      throw new BadRequestException({
        message: ["TransactionId is required"],
        error: "Bad Request",
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    return await this.transactionsService.getTransactionById(transactionId);
  }

  //TODO: Set this endpoint to be used only by admin users
  @Get()
  async findAll() {
    return await this.transactionsService.getAllTransactions();
  }

  //TODO: Set this endpoint to be used only by admin users
  @Get("logs")
  async getLogs() {
    return await this.transactionsService.getTransactionLogs();
  }
}
