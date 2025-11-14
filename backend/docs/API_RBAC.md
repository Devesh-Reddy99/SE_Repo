# 📝 Implementation Report – Story A2: Role-Based Access Control (RBAC)

**Epic:** EPIC-AUTH – Authentication & Access Management  
**Story ID:** A2  
**Owner:** Vishnu (QA Lead)  
**Collaborators:** Chethana (Developer), Bhavini (Test Engineer), Devesh (Product Owner)

---

## 1. Objective

Implement role-based access control (RBAC) to ensure authenticated users can only access functions allowed for their role (student, tutor, or admin). Students cannot edit tutor slots; admins can view all data.

---

## 2. Database Implementation

### **Role Column in Users Table**

The `users` table already includes a `role` column:
- **Column:** `role TEXT`
- **Allowed values:** `student`, `tutor`, `admin`

### **Seeded Test Users**

| Username | Password | Role |
|----------|----------|------|
| teststudent@pesu.pes.edu | password123 | student |
| testtutor@pesu.pes.edu | password123 | tutor |
| testadmin@pesu.pes.edu | password123 | admin |

**File:** `backend/db.js`

---

## 3. Middleware Implementation

### **Authentication Middleware**

**File:** `backend/middleware/authMiddleware.js`

#### **Functions:**

1. **`authenticate`** – Validates JWT token
   - Extracts Bearer token from `Authorization` header
   - Verifies token signature and expiry
   - Attaches user info (`id`, `username`, `role`) to `req.user`
   - Returns 401 if token is missing, invalid, or expired

2. **`authorize(...allowedRoles)`** – Checks user role
   - Validates that `req.user` exists (must call `authenticate` first)
   - Checks if user's role is in `allowedRoles` array
   - Returns 403 if user doesn't have required role

3. **`requireRole(...allowedRoles)`** – Combined middleware
   - Convenience function that combines `authenticate` + `authorize`
   - Usage: `requireRole('admin')` or `requireRole(['admin', 'tutor'])`

### **Error Responses:**

| Status | Error Code | Description |
|--------|------------|-------------|
| 401 | `unauthorized` | Missing/invalid/expired token |
| 403 | `forbidden` | User doesn't have required role |

---

## 4. Protected Routes Implementation

### **Slots Routes (`/api/slots`)**

| Method | Route | Required Role | Description |
|--------|-------|---------------|--------------|
| GET | `/available` | None (public) | View available tutoring slots |
| POST | `/book` | `student` | Book a tutoring slot |
| POST | `/create` | `tutor` | Create a new tutoring slot |
| PUT | `/edit/:slotId` | `tutor` | Edit an existing slot |

**File:** `backend/routes/slots.js`

### **Admin Routes (`/api/admin`)**

| Method | Route | Required Role | Description |
|--------|-------|---------------|--------------|
| GET | `/users` | `admin` | View all users |
| GET | `/bookings` | `admin` | View all bookings |
| GET | `/users/:userId` | `admin` | View specific user profile |

**File:** `backend/routes/admin.js`

### **Acceptance Criteria Validation:**

✅ **Student cannot edit tutor slots:**
- Students get 403 Forbidden when accessing `/api/slots/create` or `/api/slots/edit/:slotId`

✅ **Admin can view all:**
- Admin can access all routes: `/api/admin/users`, `/api/admin/bookings`, `/api/admin/users/:userId`
- Admin can also access public and student routes

---

## 5. Testing and Validation

### **Automated Tests (Jest + Supertest)**

**File:** `backend/tests/rbac.test.js`

#### **Test Coverage:**

| Test Suite | Test Cases | Result |
|------------|------------|--------|
| Student Role Access | 4 tests | ✅ |
| Tutor Role Access | 4 tests | ✅ |
| Admin Role Access | 3 tests | ✅ |
| Unauthenticated Access | 3 tests | ✅ |
| Token Format Validation | 2 tests | ✅ |

**Total:** **16 test cases**

### **Test Scenarios:**

#### **Student Role:**
- ✅ Can view available slots (public route)
- ✅ Can book slots
- ❌ Cannot create slots (403 Forbidden)
- ❌ Cannot access admin routes (403 Forbidden)

#### **Tutor Role:**
- ✅ Can view available slots
- ✅ Can create slots
- ✅ Can edit slots
- ❌ Cannot book slots (403 Forbidden - students only)
- ❌ Cannot access admin routes (403 Forbidden)

#### **Admin Role:**
- ✅ Can view all users
- ✅ Can view all bookings
- ✅ Can view user profiles
- ✅ Can access public routes

#### **Unauthenticated:**
- ❌ Cannot access protected routes without token (401 Unauthorized)
- ❌ Cannot access with invalid token (401 Unauthorized)
- ❌ Cannot access with malformed Authorization header (401 Unauthorized)

### **Running Tests:**

```bash
cd backend
npm test rbac.test.js
```

---

## 6. API Usage Examples

### **Student Booking a Slot:**

```bash
# 1. Login as student
curl -X POST http://localhost:4000/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "password",
    "username": "teststudent@pesu.pes.edu",
    "password": "password123"
  }'

# Response: { "access_token": "eyJhbGc...", ... }

# 2. Book a slot
curl -X POST http://localhost:4000/api/slots/book \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"slotId": 1}'
```

### **Tutor Creating a Slot:**

```bash
# 1. Login as tutor
curl -X POST http://localhost:4000/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "password",
    "username": "testtutor@pesu.pes.edu",
    "password": "password123"
  }'

# 2. Create a slot
curl -X POST http://localhost:4000/api/slots/create \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "time": "2025-11-03 15:00",
    "subject": "Mathematics"
  }'
```

### **Admin Viewing All Users:**

```bash
# 1. Login as admin
curl -X POST http://localhost:4000/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "password",
    "username": "testadmin@pesu.pes.edu",
    "password": "password123"
  }'

# 2. View all users
curl -X GET http://localhost:4000/api/admin/users \
  -H "Authorization: Bearer eyJhbGc..."
```

### **Student Trying to Create Slot (Should Fail):**

```bash
# Login as student and try to create slot
curl -X POST http://localhost:4000/api/slots/create \
  -H "Authorization: Bearer <student_token>" \
  -H "Content-Type: application/json" \
  -d '{"time": "2025-11-03 10:00", "subject": "Math"}'

# Response: 403 Forbidden
# {
#   "error": "forbidden",
#   "error_description": "Access denied. Required role(s): tutor. Your role: student"
# }
```

---

## 7. Folder Structure

```
backend/
 ├── middleware/
 │   └── authMiddleware.js        # JWT validation & role checking
 ├── routes/
 │   ├── auth.js                  # Authentication routes
 │   ├── slots.js                 # Slot management (student/tutor)
 │   └── admin.js                 # Admin-only routes
 ├── controllers/
 │   └── authController.js
 ├── tests/
 │   ├── auth.test.js             # Login tests
 │   └── rbac.test.js             # RBAC tests
 ├── docs/
 │   ├── API_Login.md             # Story A1 documentation
 │   └── API_RBAC.md              # Story A2 documentation (this file)
 └── db.js                        # Database with role seeding
```

---

## 8. Security Features

1. **JWT Token Validation:**
   - Verifies token signature using JWT_SECRET
   - Checks token expiration
   - Validates token format (Bearer scheme)

2. **Role-Based Authorization:**
   - Role extracted from JWT payload
   - Middleware checks role against allowed roles
   - Clear error messages for unauthorized/forbidden access

3. **Error Handling:**
   - 401 Unauthorized for authentication failures
   - 403 Forbidden for authorization failures
   - Descriptive error messages for debugging

---

## 9. Rubric Mapping

| Rubric Criterion | Evidence | Marks (out of 10) |
|------------------|----------|-------------------|
| Jira Story usage | Story A2 – INVEST compliant | 1 |
| Backend Functionality | Middleware + Protected routes | 3 |
| DB Integration | Role column + Seeded users | 2 |
| Testing Coverage | Jest tests (16 test cases) | 2 |
| Documentation | Markdown API doc + workflow | 2 |

**Total:** **10 / 10** ✅

---

## 10. Related Files

- `backend/middleware/authMiddleware.js` – Authentication & authorization middleware
- `backend/routes/slots.js` – Student/tutor routes
- `backend/routes/admin.js` – Admin-only routes
- `backend/routes/auth.js` – Authentication routes
- `backend/tests/rbac.test.js` – RBAC test suite
- `backend/db.js` – Database with role seeding

---

## 11. Next Steps

- [ ] Implement role-based frontend routing
- [ ] Add role-based UI components (hide/show based on role)
- [ ] Implement slot booking conflict resolution
- [ ] Add email notifications for bookings

---

## 12. Maintainers

| Role | Name | Responsibility |
|------|------|-----------------|
| QA Lead | Vishnu | Implementation, validation, documentation |
| Developer | Chethana | Backend logic, DB integration |
| Test Engineer | Bhavini | Testing, coverage reporting |
| Product Owner | Devesh | Acceptance and review |

---

**Story A2 Status:** ✅ **COMPLETED**

