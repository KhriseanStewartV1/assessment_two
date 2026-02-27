# Community Service Booking API

Backend for the Community Service Booking Application (NodeJS + Express + MySQL). Paper 2 – Backend Development.

## Prerequisites

- Node.js (v14 or higher)
- MySQL server

## Setup

1. **Clone the repository** (or use the project folder).

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create the database:**

   - Create a MySQL database (or use the name you will set in `.env`).
   - Run the schema and seed script:

   ```bash
   mysql -u your_user -p < database/schema.sql
   ```

   Or open `database/schema.sql` in MySQL Workbench and execute it. This creates the `community_booking` database, tables (users, booking_status, services, bookings), and seed data (user id=1, statuses, sample services).

4. **Environment variables:**

   Copy the example env file and set your MySQL credentials:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set:

   - `PORT` – optional, default 3000
   - `DB_HOST` – MySQL host (e.g. localhost)
   - `DB_USER` – MySQL username
   - `DB_PASSWORD` – MySQL password
   - `DB_NAME` – database name (e.g. community_booking)

5. **Start the server:**

   ```bash
   npm start
   ```

   Server runs at `http://localhost:3000` (or the port in `PORT`).

## API Endpoints

Base URL: `http://localhost:3000/api`

### Services

| Method | Endpoint             | Description                |
|--------|----------------------|----------------------------|
| GET    | /api/services        | Get all services           |
| GET    | /api/services/:id    | Get one service by ID      |
| POST   | /api/services        | Create a service           |
| PUT    | /api/services/:id    | Update a service           |
| DELETE | /api/services/:id    | Delete a service           |

**Create/Update service body (JSON):**  
`name` (string, required), `description` (string, optional), `price` (number, required), `estimated_duration_minutes` (number, required), `is_available` (boolean, optional, default true).

### Bookings

| Method | Endpoint                  | Description                    |
|--------|---------------------------|--------------------------------|
| GET    | /api/bookings             | Get all bookings               |
| GET    | /api/bookings/:id         | Get one booking by ID         |
| POST   | /api/bookings             | Create a booking (user_id=1)   |
| PUT    | /api/bookings/:id         | Update booking status          |
| PUT    | /api/bookings/:id/cancel  | Cancel a booking               |

**Create booking body (JSON):**  
`service_id` (number, required), `booking_date` (string, e.g. "2025-03-01"), `booking_time` (string, e.g. "14:00:00"), `notes` (string, optional).

**Update status body (JSON):**  
`status_id` (number, required): 1 = Scheduled, 2 = Completed, 3 = Cancelled.

## Response format

- Success: `{ "success": true, "data": ... }`
- Error: `{ "success": false, "error": "message" }`

HTTP status codes: 200 OK, 201 Created, 400 Bad Request (validation), 404 Not Found, 500 Internal Server Error.

## Project structure

- `server.js` – Entry point, Express app, routes, error middleware
- `config/db.js` – MySQL connection pool (uses env vars)
- `routes/` – serviceRoutes.js, bookingRoutes.js
- `controllers/` – serviceController.js, bookingController.js
- `middleware/errorHandler.js` – Centralized error handler
- `database/schema.sql` – CREATE TABLE and seed data

## Testing with Postman

Import the base URL and call each endpoint. For POST/PUT, set body to raw JSON and include the fields above. Screenshot each request (method, URL, body, response, status code) for your submission.
