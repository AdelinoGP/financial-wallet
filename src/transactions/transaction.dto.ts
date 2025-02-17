import { IsInt, IsString, Min } from "class-validator";

export class CreateTransactionDto {
  @IsString()
  receiverId: string;

  @IsInt({ message: "Amount must be an integer" })
  @Min(1)
  amount: number;
}
