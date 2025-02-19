## Auth API Documentation

### Overview
The Auth API provides endpoints for user authentication, including user registration and login. These endpoints handle the creation of new user accounts and the authentication of existing users, returning JWT tokens for secure access to protected resources.

### Endpoints

#### 1. Register User
**Endpoint:** `POST /auth/register`

**Description:** Registers a new user with the provided details.

**Authentication:** None

**Parameters:**
  - `firstName` (string, required): The first name of the user.
  - `lastName` (string, required): The last name of the user.
  - `documentId` (string, required): The CPF document ID of the user.
  - `password` (string, required): The password for the user account.
  - `email` (string, required): The email address of the user.

**Example Request:**
```http
POST /auth/register HTTP/1.1
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "documentId": "65715195004",
  "password": "password123",
  "email": "john.doe@example.com"
}
```

**Example Response:**
```json
{
  "id": "c553e73d-86fe-4250-9a47-2837059094ee",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "documentId": "65715195004",
  "balanceCents": 0,
  "createdAt": "2025-02-18T12:34:56.789Z"
}
```

**Error Responses:**
- **Conflict (409):** If a user with the same email or document ID already exists.
  ```json
  {
    "statusCode": 409,
    "message": ["A user with this email or document ID already exists."],
    "error": "Conflict"
  }
  ```

#### 2. Login User
**Endpoint:** `POST /auth/login`

**Description:** Logs in an existing user with the provided credentials.

**Authentication:** None

**Parameters:**
- `LoginDto` (object, required): The data transfer object containing login details.
  - `email` (string, required): The email address of the user.
  - `password` (string, required): The password for the user account.

**Example Request:**
```http
POST /auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Example Response:**
```json
{
  "user": {
    "id": "c553e73d-86fe-4250-9a47-2837059094ee",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "documentId": "65715195004",
    "balanceCents": 100000,
    "createdAt": "2025-02-18T12:34:56.789Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- **Unauthorized (401):** If the provided credentials are invalid.
  ```json
  {
    "statusCode": 401,
    "message": "Credenciais inválidas",
    "error": "Unauthorized"
  }
  ```

### Authentication
The Auth API endpoints do not require authentication. However, the login endpoint returns a JWT token that should be used to authenticate subsequent requests to protected endpoints.

### Error Handling
Errors are returned with appropriate HTTP status codes and a JSON response containing the error details.

**Example Error Response:**
```json
{
  "statusCode": 409,
  "message": ["A user with this email or document ID already exists."],
  "error": "Conflict"
}
```
