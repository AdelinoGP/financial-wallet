## Transactions API Documentation

### Overview
The Transactions API provides endpoints for managing financial transactions, including creating transactions, reversing transactions, and retrieving transaction details. Authentication is required for most endpoints to ensure secure access to transaction data.

### Endpoints

#### 1. Create Transaction
**Endpoint:** `POST /transactions`

**Description:** Creates a new transaction to transfer funds from the authenticated user to another user.

**Authentication:** JWT required

**Parameters:**
  - `receiverId` (string, required): The ID of the user receiving the funds.
  - `amount` (number, required): The amount to be transferred (must be an integer greater than 0).

**Example Request:**
```http
POST /transactions HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "receiverId": "user456",
  "amount": 5000
}
```

**Example Response:**
```json
{
  "id": "97783d9c-f5d9-4112-a94b-d0c2f9ce6f3e",
  "senderId": "c553e73d-86fe-4250-9a47-2837059094ee",
  "receiverId": "e07d173b-57cf-44c9-945e-9f773eeb26bc",
  "amount": 5000,
  "status": "COMPLETED",
  "type": "TRANSFER",
  "createdAt": "2025-02-18T12:34:56.789Z",
  "updatedAt": "2025-02-18T12:34:56.789Z"
}
```

**Error Responses:**
- **Forbidden (403):** If the transaction amount exceeds the limit.
    ```json
    {
        "statusCode": 403,
        "message": "Transaction amount exceeds the limit",
        "error": "Forbidden"
    }
    ```
- **Conflict (409):** If the user tries to send money to themselves.
    ```json
    {
        "statusCode": 409,
        "message": "User cannot send money to themselves",
        "error": "Conflict"
    }
    ```
- **Not Acceptable (406):** If the user has insufficient funds.
    ```json
    {
        "statusCode": 406,
        "message": "Insufficient funds",
        "error": "Not Acceptable"
    }
    ```
- **Not Found (404):** If the receiver is not found.
    ```json
    {
        "statusCode": 404,
        "message": "User not found",
        "error": "Not Found"
    }
    ```
- **Forbidden (403):** If the receiver is not KYC verified.
    ```json
    {
        "statusCode": 403,
        "message": "Receiver is not Verified",
        "error": "Forbidden"
    }
    ```
- **Forbidden (403):** If the user tries to make too many transactions in a short period.
    ```json
    {
        "statusCode": 403,
        "message": "Too many transactions in a short period",
        "error": "Forbidden"
    }
    ```

#### 2. Reverse Transaction
**Endpoint:** `POST /transactions/reverse`

**Description:** Reverses a completed transaction initiated by the authenticated user.

**Authentication:** JWT required

**Parameters:**
- `transactionId` (string, required): The ID of the transaction to be reversed.

**Example Request:**
```http
POST /transactions/reverse HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "transactionId": "e07d173b-57cf-44c9-945e-9f773eeb26bc"
}
```

**Example Response:**
```json
{
  "id": "8fabd5b8-ae18-4ef8-b2c4-d9f8c68c84b4",
  "senderId": "c553e73d-86fe-4250-9a47-2837059094ee",
  "receiverId": "e07d173b-57cf-44c9-945e-9f773eeb26bc",
  "amount": 5000,
  "status": "COMPLETED",
  "type": "REVERSAL",
  "createdAt": "2025-02-18T12:45:56.789Z",
  "updatedAt": "2025-02-18T12:45:56.789Z"
}
```

**Error Responses:**
- **Bad Request (400):** If the transaction cannot be reversed.
    ```json
    {
        "statusCode": 400,
        "message": "Only completed transactions can be reversed",
        "error": "Bad Request"
    }
    ```
- **Bad Request (400):** If the transaction is non-refundable.
    ```json
    {
        "statusCode": 400,
        "message": "Non Refundable Transactions cannot be reversed",
        "error": "Bad Request"
    }
    ```
- **Bad Request (400):** If the sender is not the one who initiated the transaction.
    ```json
    {
        "statusCode": 400,
        "message": "Only the sender can reverse the transaction",
        "error": "Bad Request"
    }
    ```
- **Not Found (404):** If the transaction is not found.
    ```json
    {
        "statusCode": 404,
        "message": "Transaction not found",
        "error": "Not Found"
    }
    ```

#### 3. Get Transactions by User
**Endpoint:** `GET /transactions/user`

**Description:** Retrieves all transactions involving the authenticated user.

**Authentication:** JWT required

**Parameters:** None

**Example Request:**
```http
GET /transactions/user HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
```

**Example Response:**
```json
[
  {
    "id": "8fabd5b8-ae18-4ef8-b2c4-d9f8c68c84b4",
    "senderId": "c553e73d-86fe-4250-9a47-2837059094ee",
    "receiverId": "e07d173b-57cf-44c9-945e-9f773eeb26bc",
    "amount": 5000,
    "status": "COMPLETED",
    "type": "TRANSFER",
    "createdAt": "2025-02-18T12:34:56.789Z",
    "updatedAt": "2025-02-18T12:34:56.789Z"
  },
  {
    "id": "4f85db50-c99b-4dc9-a7ed-81b0a850bb64",
    "senderId": "c553e73d-86fe-4250-9a47-2837059094ee",
    "receiverId": "e07d173b-57cf-44c9-945e-9f773eeb26bc",
    "amount": 5000,
    "status": "COMPLETED",
    "type": "REVERSAL",
    "createdAt": "2025-02-18T12:45:56.789Z",
    "updatedAt": "2025-02-18T12:45:56.789Z",

  }
]
```

#### 4. Get Transaction by ID
**Endpoint:** `GET /transactions/id`

**Description:** Retrieves details of a specific transaction by its ID. This endpoint should be restricted to admin users.

**Authentication:** None (On a production environment it should be restricted to admin users)

**Parameters:**
- `transactionId` (string, required): The ID of the transaction.

**Example Request:**
```http
GET /transactions/id HTTP/1.1
Content-Type: application/json

{
  "transactionId": "transaction123"
}
```

**Example Response:**
```json
{
  "id": "transaction123",
  "senderId": "user123",
  "receiverId": "user456",
  "amount": 5000,
  "status": "COMPLETED",
  "type": "TRANSFER",
  "createdAt": "2025-02-18T12:34:56.789Z"
}
```

**Error Responses:**
- **Bad Request (400):** If the transaction ID is not provided.
  ```json
  {
    "statusCode": 400,
    "message": "TransactionId is required",
    "error": "Bad Request"
  }
  ```

#### 5. Get All Transactions
**Endpoint:** `GET /transactions`

**Description:** Retrieves a list of all transactions. This endpoint should be restricted to admin users.

**Authentication:** None (On a production environment it should be restricted to admin users)

**Parameters:** None

**Example Request:**
```http
GET /transactions HTTP/1.1
```

**Example Response:**
```json
[
  {
    "id": "3631dd24-0a52-4da2-bb3b-48b08cfe9943",
    "senderId": "c553e73d-86fe-4250-9a47-2837059094ee",
    "receiverId": "e07d173b-57cf-44c9-945e-9f773eeb26bc",
    "amount": 5000,
    "status": "COMPLETED",
    "type": "TRANSFER",
    "createdAt": "2025-02-18T12:34:56.789Z",
    "updatedAt": "2025-02-18T12:34:56.789Z"
  },
  {
    "id": "4dcdc01e-0cbe-4cc3-a747-655841ef065d",
    "senderId": "c553e73d-86fe-4250-9a47-2837059094ee",
    "receiverId": "e07d173b-57cf-44c9-945e-9f773eeb26bc",
    "amount": 5000,
    "status": "COMPLETED",
    "type": "REVERSAL",
    "createdAt": "2025-02-18T12:45:56.789Z",
    "updatedAt": "2025-02-18T12:45:56.789Z"
  }
]
```

#### 6. Get Transaction Logs
**Endpoint:** `GET /transactions/logs`

**Description:** Retrieves logs of all transactions. This endpoint should be restricted to admin users.

**Authentication:** None (On a production environment it should be restricted to admin users)

**Parameters:** None

**Example Request:**
```http
GET /transactions/logs HTTP/1.1
```

**Example Response:**
```json
[
  {
    "transactionId": "transaction123",
    "status": "COMPLETED",
    "loggedMessage": "[Transaction] New TRANSFER Transaction, ID: transaction123, From Sender ID: user123 to Receiver ID: user456, Amount: 5000, Status: COMPLETED, Type: TRANSFER, CalledBy: Create"
  },
  {
    "transactionId": "transaction124",
    "status": "COMPLETED",
    "loggedMessage": "[Transaction] New REVERSAL Transaction, ID: transaction124, From Sender ID: user123 to Receiver ID: user456, Amount: 5000, Status: COMPLETED, Type: REVERSAL, CalledBy: Reverse"
  }
]
```

### Authentication
Endpoints that require authentication use JWT tokens. The token should be included in the `Authorization` header as a Bearer token.

**Example:**
```http
Authorization: Bearer <JWT_TOKEN>
```

### Error Handling
Errors are returned with appropriate HTTP status codes and a JSON response containing the error details.

**Example Error Response:**
```json
{
  "statusCode": 400,
  "message": "TransactionId is required",
  "error": "Bad Request"
}
```
