🧟 Gestión del fin | Sanctuary Protocol
Sistema de gestión de supervivencia para campamentos post-apocalípticos.

---

## 🔧 Backend Implementation (Updated)

The backend has been initialized using:

* Node.js
* Express.js
* MySQL

---

## 📌 Current Modules Implemented

### 🏕️ Camps

* GET /api/camps → Get all camps
* POST /api/camps → Create camp
* PUT /api/camps/:id → Update camp

⚠️ Camps are not physically deleted.
Logical deletion is handled using the `status` field to preserve referential integrity.

---

### 👤 Admissions (Core System Logic)

* POST /api/admissions → Create admission request
* GET /api/admissions → Get all admission requests
* PUT /api/admissions/:id/approve → Approve admission
* PUT /api/admissions/:id/reject → Reject admission

🧠 Admission Flow:

* A person submits an admission request
* Request starts with status: `pending`
* When approved:

  * Admission status → `approved`
  * Person is assigned to a camp (`camp_id`)
  * Person status → `active`
* When rejected:

  * Admission status → `rejected`
  * Person remains without camp

---

### 🔄 Camp Requests (Inter-Camp System)

* POST /api/camp-requests → Create request
* POST /api/camp-requests/:id/resources → Add resources
* POST /api/camp-requests/:id/persons → Add persons
* PUT /api/camp-requests/:id/approve → Approve request
* PUT /api/camp-requests/:id/reject → Reject request
* GET /api/camp-requests → Get all requests

🧠 Flow:

* A camp requests resources or personnel from another camp
* Request is built incrementally (resources/persons)
* On approval:

  * Resources are transferred between inventories
  * People are reassigned between camps
  * Movements are logged
* Full transaction support ensures data consistency

---

### 📦 Inventory (Resource Management)

* GET /api/inventory → Get all inventory
* GET /api/inventory/:camp_id → Get inventory by camp
* POST /api/inventory → Add or increase resources
* PUT /api/inventory/:id → Update quantity

🧠 Features:

* Supports **decimal quantities** (e.g., water, fuel)
* Uses `ON DUPLICATE KEY UPDATE` for aggregation
* Prevents negative or invalid values

---

## ⚙️ Key Technical Features

* ✅ Transaction management for critical operations
* ✅ Decimal handling for flexible resource quantities
* ✅ Data validation at model level
* ✅ Referential integrity enforced via foreign keys
* ✅ Logical deletion strategy for camps
* ✅ Consistent error handling

---

## 📁 Backend Structure

backend/
├── src/
│ ├── config/
│ ├── models/
│ ├── controllers/
│ ├── routes/
│ ├── app.js
│ └── index.js

---

## 🚀 Next Steps

* Authentication & Authorization (user_account + roles)
* Resource API
* Profession API
* Exploration module
* AI-based admission evaluation
