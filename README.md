# Financial Wallet Backend

## Overview
Simple Financial Wallet backend built with NestJS, TypeScript, and Prisma ORM. It allows users to create a financial wallet, send and receive money, and manage their transactions efficiently.

## Features
- User registration and authentication
- Send and receive money between users
- Transaction logging and validation
- Reversible transactions in case of inconsistencies

## Technologies Used
- **Backend Framework**: NestJS
- **Database**: PostgreSQL
- **Testing**: Jest
- **ORM**: Prisma
- **Containerization**: Docker
- **E2E Tests**: Insomnia

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- Docker

### Installation
1. Clone the repository:
   ```
   git clone https://github.com/AdelinoGP/financial-wallet.git
   cd financial-wallet
   ```

2. Install dependencies:
   ```
   yarn install
   ```

3. Start the PostgreSQL container using Docker:
   ```
   docker-compose up
   ```

4. Update the database connection settings in the `.env` file (create one based on `example.env`).

### Running the Application
To start the application, run:
```
yarn start:dev
```

### Docker Setup
To run the application using Docker, execute:
```
docker-compose -f docker-compose-full-app.yml up --build
```

## Security Considerations
The application implements basic KYC and AML checks during user registration and transaction processing.

## Possible Enhancements
- Integration with RabbitMQ for asynchronous processing of transactions
- Advanced KYC and AML verification processes
- TFA and other checks to better comply with PSD2 regulations and ensure secure financial transactions.
