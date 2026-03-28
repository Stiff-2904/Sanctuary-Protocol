# 🧟 Gestión del fin | Sanctuary Protocol

> Sistema de gestión de supervivencia para campamentos post-apocalípticos.

---

## 🔧 Backend Implementation (Updated)

The backend has been initialized using:

- Node.js
- Express.js
- MySQL

### 📌 Current Modules Implemented

---

### 🏕️ Camps

- GET /api/camps → Get all camps  
- POST /api/camps → Create camp  
- PUT /api/camps/:id → Update camp  

⚠️ Camps are not physically deleted.  
Logical deletion is handled using the `status` field to preserve referential integrity.

---

### 👤 Admissions (Core System Logic)

- POST /api/admissions → Create admission request  
- GET /api/admissions → Get all admission requests  
- PUT /api/admissions/:id/approve → Approve admission  

---

### 🧠 Admission Flow

1. A person submits an admission request  
2. Request starts with status: `pending`  
3. When approved:
   - Admission status → `approved`
   - Person is assigned to a camp (`camp_id`)
   - Person status → `active`

---

### ⚠️ Important Design Decisions

- `person.camp_id` is nullable (assigned only after approval)
- Referential integrity is enforced (no unsafe deletes)
- Camps use logical deletion instead of physical deletion

---

### 📁 Backend Structure

backend/
├── src/
│ ├── config/
│ ├── models/
│ ├── controllers/
│ ├── routes/
│ ├── app.js
│ └── index.js

## 🚀 Next Steps

- Admission rejection
- AI evaluation module
- Camp-to-camp requests
- Resource and person movement
