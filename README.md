# Sanctuary Protocol — Backend

## Overview

Sanctuary Protocol is a backend system designed to manage survival camps in a post-apocalyptic environment. It handles people admissions, resource management, and inter-camp operations with secure access control.

---

## Technologies

* Node.js
* Express.js
* MySQL
* MVC Architecture
* JWT Authentication
* Role-Based Authorization

---

## Security

The system includes:

* JWT-based authentication
* Role-based access control
* Camp-level data restriction
* Protected routes using middleware

---

## System Roles

* **SuperAdmin** → Full access to all system operations
* **Admin** → Manages admissions
* **ResourceManager** → Handles inventory and resources
* **Worker** → Limited inventory operations
* **ExpeditionManager** → Manages camp requests and logistics

---

## Modules

### Camps

* `GET /api/camps`
* `POST /api/camps`
* `PUT /api/camps/:id`

Logical deletion is used via a status field.

---

### Admissions

* `POST /api/admissions`
* `GET /api/admissions`
* `PUT /api/admissions/:id/approve`
* `PUT /api/admissions/:id/reject`

**Flow:**

* A person submits a request
* Status starts as `pending`
* Admin approves or rejects
* On approval → person is assigned to a camp

---

### Inventory

* `GET /api/inventory` (SuperAdmin / ResourceManager)
* `GET /api/inventory/me` (Worker / ResourceManager)
* `POST /api/inventory`
* `PUT /api/inventory/:id`

**Features:**

* Quantity aggregation using `ON DUPLICATE KEY UPDATE`
* Decimal resource support
* Validation against invalid values

---

### Camp Requests

* `POST /api/camp-requests`
* `POST /api/camp-requests/:id/resources`
* `POST /api/camp-requests/:id/persons`
* `PUT /api/camp-requests/:id/approve`
* `PUT /api/camp-requests/:id/reject`
* `GET /api/camp-requests`

**Flow:**

* Requests are created between camps
* Resources and persons are attached
* Approval triggers transfers and updates

---

## Key Features

* Transaction management for critical operations
* Data validation at model level
* Referential integrity via foreign keys
* Role-based route protection
* Middleware-based architecture
* Secure API access using JWT

---

## Project Structure

backend/
└── src/
├── config/
├── models/
├── controllers/
├── routes/
├── middlewares/
├── utils/
├── app.js
└── index.js

---

## Current Status

* Core backend functionality implemented
* Authentication and authorization completed
* Role-based access fully enforced
* System ready for frontend integration

---

## Future Improvements

* AI-based admission evaluation
* Logging and auditing
* Frontend integration
* Advanced validations

---

## Author

Gaudy Montero
