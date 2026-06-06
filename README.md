# Sanctuary Protocol — Backend

## Overview

Sanctuary Protocol is a backend system designed to manage survival camps in a post-apocalyptic environment. The system handles admissions, camp management, inventories, resource transfers, explorations, workforce management, health conditions, production and consumption of resources, and AI-assisted evaluations.

---

## Technologies

- Node.js
- Express.js
- TiDB Cloud (MySQL Compatible)
- MVC Architecture
- JWT Authentication
- Role-Based Authorization

---

## Security

The system includes:

- JWT-based authentication
- Role-based access control
- Camp-level data restrictions
- Protected routes using middleware
- Session timeout validation

---

## System Roles

### SuperAdmin

Full access to all modules and camps.

### Admin

Manages admissions, camp operations, and approvals.

### ResourceManager

Manages inventory and resources.

### Worker

Limited inventory access and camp operations.

### ExpeditionManager

Manages expeditions and camp logistics.

---

# Modules

## Authentication

### Endpoints

```http
POST /api/auth/login
POST /api/auth/register
```

---

## Camps

### Endpoints

```http
GET    /api/camps
POST   /api/camps
PUT    /api/camps/:id
```

### Features

- Create camps
- Update camp information
- Logical activation/deactivation through status field

---

## Admissions

### Endpoints

```http
POST   /api/admissions
GET    /api/admissions
GET    /api/admissions/:id
PATCH  /api/admissions/:id/decide
```

### Features

- Admission requests
- AI evaluation support
- Human approval workflow
- Automatic profession assignment
- Audit logging

---

## Persons

### Features

- Person management
- Camp assignment
- Profession assignment
- Health condition tracking

### Health Status

Supported values:

```text
healthy
injured
sick
away
```

---

## Inventory

### Endpoints

```http
GET    /api/inventory
GET    /api/inventory/me
POST   /api/inventory
PUT    /api/inventory/:id
```

### Features

- Resource stock management
- Quantity aggregation
- Decimal quantities support
- Minimum inventory thresholds

---

## Resources

### Endpoints

```http
GET    /api/resources
GET    /api/resources/:id
POST   /api/resources
PUT    /api/resources/:id
```

---

## Professions

### Endpoints

```http
GET    /api/professions
GET    /api/professions/:id
POST   /api/professions
PUT    /api/professions/:id
```

### Supported Professions

- Médico
- Constructor
- Defensa
- Agricultor
- Explorador
- Recolector
- Cocinero

---

## Camp Requests

### Endpoints

```http
POST   /api/camp-requests
POST   /api/camp-requests/:id/resources
POST   /api/camp-requests/:id/persons
PUT    /api/camp-requests/:id/approve
PUT    /api/camp-requests/:id/reject
GET    /api/camp-requests
```

### Features

- Resource transfer requests
- Personnel transfer requests
- Approval workflow
- Inventory updates
- Movement tracking

---

## Explorations

### Endpoints

```http
GET    /api/explorations
GET    /api/explorations/:id
POST   /api/explorations
PUT    /api/explorations/:id
PATCH  /api/explorations/:id/complete
```

### Features

- Expedition management
- Resource discovery tracking
- Personnel assignment
- Exploration status tracking

---

## Metrics Dashboard

### Endpoints

```http
GET /api/metrics
GET /api/metrics/alerts
```

### Metrics

- Active persons
- Healthy persons
- Injured persons
- Sick persons
- Away persons
- Active camps
- Active explorations
- Pending admissions
- Total resources
- Critical inventory alerts

---

## Temporary Worker Reassignment

### Endpoints

```http
GET    /api/temporary-assignments
GET    /api/temporary-assignments/history
POST   /api/temporary-assignments
PATCH  /api/temporary-assignments/:id/end
```

### Features

- Temporary profession changes
- Automatic profession restoration
- Assignment history
- Workforce flexibility

---

## Daily Production & Consumption

### Endpoints

```http
POST /api/production/process-daily/:camp_id
```

### Features

- Daily food production
- Daily water production
- Daily resource consumption
- Inventory updates
- Production history logging
- Duplicate execution prevention
- Inventory validation to avoid negative resources

### Production Rules

Agricultor:

```text
+3 Food per day
```

Recolector:

```text
+3 Water per day
```

Every active person consumes:

```text
-1 Food per day
-1 Water per day
```

---

## Alerts System

### Features

The system generates alerts when:

- Inventory falls below minimum thresholds
- Critical resources are detected
- Camp metrics indicate operational risks

---

# Testing Notes

Recommended testing order:

1. Authentication
2. Camps
3. Resources
4. Professions
5. Inventory
6. Admissions
7. Explorations
8. Camp Requests
9. Temporary Assignments
10. Production & Consumption
11. Metrics & Alerts

---

# Project Structure

backend/
└── src/
├── config/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── services/
├── utils/
├── app.js
└── index.js

---

# Current Status

Implemented:

- Authentication & Authorization
- Admissions with AI Evaluation
- Camp Management
- Inventory Management
- Resource Management
- Profession Management
- Exploration Module
- Metrics Dashboard
- Alerts System
- Temporary Worker Reassignment
- Daily Production & Consumption

Pending:

- Dual Approval Workflow for Camp Transfers

---

## Author

Gaudy Montero
