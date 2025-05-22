# DrawMaster Hub Backend API

Backend server for the DrawMaster Hub application - a platform for managing drawing contests, submissions, and winner announcements.

## Features

- User authentication and authorization
- Contest management
- Submission processing
- Winner announcement functionality
- Secure API endpoints with JWT authentication

## Tech Stack

- Node.js/Express
- MongoDB/Mongoose
- JWT Authentication
- bcrypt for password hashing
- Cors for cross-origin resource sharing

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login and get JWT token
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/updatedetails` - Update user details
- `PUT /api/users/updatepassword` - Update user password

### Contests
- `GET /api/contests` - Get all contests (filterable by status)
- `GET /api/contests/:id` - Get single contest details
- `POST /api/contests` - Create a new contest (admin only)
- `PUT /api/contests/:id` - Update contest details (admin only)
- `DELETE /api/contests/:id` - Delete a contest (admin only)
- `PUT /api/contests/:id/announce-winners` - Announce contest winners (admin only)

### Submissions
- `GET /api/submissions` - Get all submissions (user-specific or all for admin)
- `GET /api/submissions/:id` - Get single submission details
- `POST /api/submissions` - Submit a new contest entry
- `PUT /api/submissions/:id` - Update a submission
- `DELETE /api/submissions/:id` - Delete a submission
- `GET /api/submissions/contest/:contestId` - Get all approved submissions for a contest
- `PUT /api/submissions/:id/status` - Approve/reject a submission (admin only)
- `PUT /api/submissions/:id/rate` - Rate a submission (after contest deadline)

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file based on `.env.example` with your configuration:
   ```
   PORT=5000
   NODE_ENV=development
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   ```

3. Start the server:
   ```
   # Development mode with nodemon
   npm run dev
   
   # Production mode
   npm start
   ```

## Database Models

### User
- name
- email
- password (hashed)
- role (user/admin)
- created date

### Contest
- title
- description
- rules
- start date
- deadline
- status (draft/active/completed/cancelled)
- prizes
- created by (user reference)
- winning submissions

### Submission
- title
- description
- image URL
- contest (reference)
- user (reference)
- rating
- review count
- status (pending/approved/rejected)
- submission date

## Authentication

The API uses JSON Web Tokens (JWT) for authentication. Protected routes require a valid token to be included in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```
