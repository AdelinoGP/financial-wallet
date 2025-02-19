## Users API Documentation

### Overview
The Users API provides endpoints for managing user information, including retrieving user details, updating user details such as email and password, and accessing user data based on various criteria. Authentication is required for certain endpoints to ensure secure access to user data.

### Endpoints

#### 1. Get Private User Information
**Endpoint:** `GET /users`

**Description:** Retrieves private information of the authenticated user.

**Authentication:** JWT required

**Parameters:** None

**Example Request:**
```http
GET /users HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
```

**Example Response:**
```json
{
  "id": "user123",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "documentId": "65715195004",
  "balanceCents": 100000,
  "createdAt": "2025-02-18T12:34:56.789Z"
}
```

#### 2. Get User by ID
**Endpoint:** `GET /users/id`

**Description:** Retrieves user information based on the provided user ID.

**Authentication:** None

**Parameters:**
- `id` (string, required): The ID of the user.

**Example Request:**
```http
GET /users/id HTTP/1.1
Content-Type: application/json

{
  "id": "user123"
}
```

**Example Response:**
```json
{
  "id": "user123",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2025-02-18T12:34:56.789Z"
}
```

#### 3. Get User by Email
**Endpoint:** `GET /users/email`

**Description:** Retrieves user information based on the provided email address.

**Authentication:** None

**Parameters:**
- `email` (string, required): The email address of the user.

**Example Request:**
```http
GET /users/email HTTP/1.1
Content-Type: application/json

{
  "email": "john.doe@example.com"
}
```

**Example Response:**
```json
{
  "id": "user123",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2025-02-18T12:34:56.789Z"
}
```

#### 4. Get User by Document ID
**Endpoint:** `GET /users/document`

**Description:** Retrieves user information based on the provided document ID.

**Authentication:** JWT required

**Parameters:**
- `documentId` (string, required): The document ID of the user.

**Example Request:**
```http
GET /users/document HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "documentId": "65715195004"
}
```

**Example Response:**
```json
{
  "id": "user123",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2025-02-18T12:34:56.789Z"
}
```

#### 5. Get All Users
**Endpoint:** `GET /users/all`

**Description:** Retrieves a list of all users. This endpoint should be restricted to admin users.

**Authentication:** None (should be restricted to admin users)

**Parameters:** None

**Example Request:**
```http
GET /users/all HTTP/1.1
```

**Example Response:**
```json
[
  {
    "id": "user123",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2025-02-18T12:34:56.789Z"
  },
  {
    "id": "user456",
    "email": "jane.smith@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "createdAt": "2025-02-18T12:34:56.789Z"
  }
]
```

#### 6. Update User
**Endpoint:** `PUT /users`

**Description:** Updates the authenticated user's profile with the provided data.

**Authentication:** JWT required

**Parameters:**
- `updateUserDto` (object, required): The data to update the user's profile.
  - `email` (string, optional): The new email address.
  - `password` (string, optional): The new password.

**Example Request:**
```http
PUT /users HTTP/1.1
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "email": "john.doe.updated@example.com",
  "password": "newpassword123"
}
```

**Example Response:**
```json
{
  "id": "user123",
  "email": "john.doe.updated@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "documentId": "65715195004",
  "balanceCents": 100000,
  "createdAt": "2025-02-18T12:34:56.789Z"
}
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
  "message": ["Id is required"],
  "error": "Bad Request"
}
```
