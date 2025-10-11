# Workoutpal Backend

This is backend repo of workout log app made with express.js & typescript. Using turso libsql as database.

## How to run

- Clone this repo.
- Add `DATABASE_URL` & `DATABASE_AUTH_TOKEN` from your turso database to `.env` file.
- Run the project using `npm run dev`.

## API Documentation

All endpoints that needs authentication require a `Bearer Token` in the `Authorization` header.

### Authentication

#### `POST /auth/register`

Register a new user.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "yourpassword",
  "fullName": "Your Name"
}
```

**Response:**

- `201 Created`: User registered successfully.
- `400 Bad Request`: Email already used.
- `500 Internal Server Error`: Error when adding user.

#### `POST /auth/login`

Login a user.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response:**

- `200 OK`: Returns a JWT token and user object.
  ```json
  {
    "token": "your-jwt-token",
    "user": {
      "email": "user@example.com",
      "fullName": "Your Name"
    }
  }
  ```
- `404 Not Found`: User not found.
- `400 Bad Request`: Password incorrect.
- `500 Internal Server Error`: Error when logging in.

#### `GET /auth/user`

Get user information by email.

**Query Parameters:**

- `email` (string, required): The email of the user.

**Response:**

- `200 OK`: Returns the user object.
  ```json
  {
    "email": "user@example.com",
    "fullName": "Your Name"
  }
  ```
- `401 Unauthorized`: Email is required.
- `404 Not Found`: User not found.
- `500 Internal Server Error`: Error when fetching user.

---

### Exercise Lists

#### `GET /exerciseLists`

Get all exercise lists for a user.

**Query Parameters:**

- `userId` (string, required): The ID of the user.

**Response:**

- `200 OK`: Returns an array of exercise lists.
  ```json
  [
    {
      "id": 1,
      "name": "My Push Day",
      "description": "Exercises for push day"
    }
  ]
  ```
- `401 Unauthorized`: userId is required.
- `500 Internal Server Error`: Error fetching exercise list.

#### `GET /exerciseLists/:listId`

Get a specific exercise list by ID.

**Response:**

- `200 OK`: Returns the exercise list object.
- `404 Not Found`: List not found.
- `500 Internal Server Error`: Error fetching exercise list.

#### `POST /exerciseLists`

Create a new exercise list.

**Request Body:**

```json
{
  "listName": "My Pull Day",
  "description": "Exercises for pull day",
  "userId": "user-id"
}
```

**Response:**

- `201 Created`: Returns the newly created exercise list object.
- `500 Internal Server Error`: Error adding exercise list.

#### `PUT /exerciseLists/:listId`

Update an exercise list.

**Request Body:**

```json
{
  "listName": "My Updated Pull Day",
  "description": "Updated exercises for pull day"
}
```

**Response:**

- `200 OK`: Returns the updated exercise list object.
- `404 Not Found`: Exercise list not found.
- `500 Internal Server Error`: Error edit exercise list.

#### `DELETE /exerciseLists/:listId`

Delete an exercise list.

**Response:**

- `204 No Content`: Exercise list deleted successfully.
- `404 Not Found`: Exercise list not found.
- `500 Internal Server Error`: Error delete exercise list.

#### `GET /exerciseLists/:listId/exercises`

Get all exercises in an exercise list.

**Response:**

- `200 OK`: Returns an array of exercises.
- `500 Internal Server Error`: Error fetching exercises.

#### `PUT /exerciseLists/:listId/exercises`

Add exercises to an exercise list.

**Request Body:**

```json
{
  "exerciseIds": [1, 2, 3]
}
```

**Response:**

- `200 OK`: Exercises added successfully.
- `400 Bad Request`: `exerciseIds` should be a non-empty array or one or more exercise IDs do not exist.
- `500 Internal Server Error`: Error updating exercises.

#### `DELETE /exerciseLists/:listId/exercises/:exerciseId`

Delete an exercise from an exercise list.

**Response:**

- `204 No Content`: Exercise deleted successfully.
- `404 Not Found`: Exercise not found.
- `500 Internal Server Error`: Error delete exercise from exercise list.

---

### Exercises

#### `GET /exercises`

Get all exercises for a user (including default exercises).

**Query Parameters:**

- `userId` (string, required): The ID of the user.

**Response:**

- `200 OK`: Returns an array of exercises.
- `401 Unauthorized`: userId is required.
- `500 Internal Server Error`: Error fetching exercise list.

#### `GET /exercises/:exerciseId`

Get a specific exercise by ID.

**Response:**

- `200 OK`: Returns the exercise object.
- `404 Not Found`: Exercise not found.
- `500 Internal Server Error`: Error fetching exercise.

#### `POST /exercises`

Create a new exercise.

**Request Body:**

```json
{
  "name": "Bench Press",
  "description": "A compound exercise for the chest, shoulders, and triceps.",
  "userId": "user-id"
}
```

**Response:**

- `201 Created`: Returns the newly created exercise object.
- `500 Internal Server Error`: Error adding exercise.

#### `PUT /exercises/:exerciseId`

Update an exercise.

**Request Body:**

```json
{
  "name": "Incline Bench Press",
  "description": "A variation of the bench press that targets the upper chest."
}
```

**Response:**

- `200 OK`: Returns the updated exercise object.
- `404 Not Found`: Exercise not found.
- `500 Internal Server Error`: Error edit exercise.

#### `DELETE /exercises/:exerciseId`

Delete an exercise.

**Response:**

- `204 No Content`: Exercise deleted successfully.
- `404 Not Found`: Exercise not found.
- `500 Internal Server Error`: Error delete exercise.

---

### Exercise Sets

#### `GET /sets`

Get all sets for an exercise in a list.

**Query Parameters:**

- `listId` (string, required): The ID of the exercise list.
- `exerciseId` (string, required): The ID of the exercise.

**Response:**

- `200 OK`: Returns an array of sets.
- `401 Unauthorized`: `listId` or `exerciseId` is required.
- `500 Internal Server Error`: Error fetching sets.

#### `GET /sets/:setId`

Get a specific set by ID.

**Response:**

- `200 OK`: Returns the set object.
- `404 Not Found`: Set not found.
- `500 Internal Server Error`: Error fetching set.

#### `POST /sets`

Create a new set for an exercise in a list.

**Request Body:**

```json
{
  "weight": 100,
  "repetition": 10,
  "listId": 1,
  "exerciseId": 1
}
```

**Response:**

- `201 Created`: Returns the newly created set object.
- `500 Internal Server Error`: Error adding set.

#### `PUT /sets/:setId`

Update a set.

**Request Body:**

```json
{
  "weight": 110,
  "repetition": 8
}
```

**Response:**

- `200 OK`: Returns the updated set object.
- `404 Not Found`: Set not found.
- `500 Internal Server Error`: Error edit set.

#### `DELETE /sets/:setId`

Delete a set.

**Response:**

- `204 No Content`: Set deleted successfully.
- `404 Not Found`: Set not found.
- `500 Internal Server Error`: Error delete set.
