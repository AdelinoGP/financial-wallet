-- CreateTable
CREATE TABLE "TransactionLogs" (
    "id" SERIAL NOT NULL,
    "transactionId" TEXT NOT NULL,
    "status" "TransactionStatus" NOT NULL,
    "loggedMessage" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionLogs_pkey" PRIMARY KEY ("id")
);
