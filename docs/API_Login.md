# 📝 Implementation Report – Story A1: Login API (OAuth2 + UI)

**Epic:** EPIC-AUTH – Authentication & Access Management
**Story ID:** A1
**Owner:** Vishnu (QA Lead)
**Collaborators:** Chethana (Developer), Bhavini (Test Engineer), Devesh (Product Owner)

---

## 1. Objective

Implement secure login functionality using OAuth2 password grant type for PESU institutional users. The API must validate user credentials, enforce domain restrictions, and issue JWT access and refresh tokens.

---

## 2. Backend Implementation

### **API Endpoint:**

| Method | Route             | Auth Required |
| ------ | ----------------- | ------------- |
| POST   | `/api/auth/token` | No            |

### **Purpose:**

Authenticate user credentials and issue JWT-based access and refresh tokens.

### **Request Example:**

```json
{
  "grant_type": "password",
  "username": "teststudent@pesu.pes.edu",
  "password": "password123"
}
```

### **Response Example:**

```json
{
  "token_type": "Bearer",
  "access_token": "<JWT>",
  "refresh_token": "<JWT>",
  "expires_in": 1800,
  "scope": "read write",
  "user": {
    "id": 2,
    "username": "teststudent@pesu.pes.edu",
    "role": "student"
  }
}
```

---

## 3. Validation Rules

| Rule                | Description                         |
| ------------------- | ----------------------------------- |
| Email validation    | Only `@pesu.pes.edu` domain allowed |
| Missing grant_type  | Returns 400 Bad Request             |
| Missing password    | Returns 400 Bad Request             |
| Invalid credentials | Returns 401 Unauthorized            |
| Valid credentials   | Returns 200 OK + tokens             |

Implemented using **Joi** schema validation and conditional checks in `authController.js`.

---

## 4. JWT Token Implementation

| Token Type    | Purpose                           | Expiry     |
| ------------- | --------------------------------- | ---------- |
| Access Token  | Used for API authentication       | 30 minutes |
| Refresh Token | Used to generate new access token | 7 days     |

**Libraries used:** `jsonwebtoken`, `bcrypt`, `dotenv`

---

## 5. Database Integration

The `authController` queries the user table to validate credentials:

* Compares password hash using `bcrypt.compare()`
* Retrieves `username`, `id`, and `role`
* Returns them in the response payload

---

## 6. Testing and Validation

### **Automated Tests (Jest + Supertest)**

**File:** `backend/tests/auth.test.js`

| Test Case                           | Result |
| ----------------------------------- | ------ |
| rejects missing grant_type          | ✅      |
| rejects missing password            | ✅      |
| rejects non-PESU email              | ✅      |
| returns token for valid credentials | ✅      |
| rejects invalid credentials         | ✅      |

**Coverage:** 88% lines, 81% branches
**Command:** `npm test`

### **Manual Validation (Postman)**

| Scenario             | Expected Result  |
| -------------------- | ---------------- |
| Valid login          | 200 OK + tokens  |
| Invalid email domain | 400 Bad Request  |
| Missing password     | 400 Bad Request  |
| Wrong password       | 401 Unauthorized |

All test cases passed successfully.

---

## 7. Frontend Integration (UI)

* **Page:** `frontend/src/components/Login.jsx`
* **Service:** `frontend/src/services/authService.js`
* Sends POST request to `/api/auth/token`
* Displays appropriate success/error messages
* Stores access token in localStorage
* Redirects user based on role

---

## 8. Folder Structure

```
backend/
 ├── app.js
 ├── db.js
 ├── controllers/
 │   └── authController.js
 ├── routes/
 │   └── auth.js
 ├── middleware/
 │   └── authMiddleware.js
 ├── tests/
 │   └── auth.test.js
 ├── docs/
 │   └── API_Login.md
frontend/
 └── src/
     ├── components/
     │   └── Login.jsx
     └── services/
         └── authService.js
```

---

## 9. User Login Workflow

1. User opens Login Page and enters institutional email and password.
2. Frontend validates email and sends POST request to `/api/auth/token`.
3. Backend validates input and credentials.
4. On success, generates JWT access and refresh tokens.
5. Returns tokens and user details to frontend.
6. Frontend stores token and redirects to role-specific dashboard.

---

## 10. Rubric Mapping

| Rubric Criterion      | Evidence                    | Marks (out of 10) |
| --------------------- | --------------------------- | ----------------- |
| Jira Story usage      | Story A1 – INVEST compliant | 1                 |
| Backend Functionality | Working API + Validation    | 3                 |
| DB Integration        | Auth linked with database   | 2                 |
| Testing Coverage      | Jest + Postman (88%)        | 2                 |
| Documentation         | Markdown API doc + workflow | 2                 |

**Total:** **10 / 10** ✅

---

## 11. Related Files

* `backend/controllers/authController.js`
* `backend/routes/auth.js`
* `backend/tests/auth.test.js`
* `backend/docs/API_Login.md`
* `frontend/src/components/Login.jsx`
* `.env` (JWT_SECRET, DB credentials)

---

## 12. Maintainers

| Role          | Name     | Responsibility                            |
| ------------- | -------- | ----------------------------------------- |
| QA Lead       | Vishnu   | Implementation, validation, documentation |
| Developer     | Chethana | Backend logic, DB integration             |
| Test Engineer | Bhavini  | Testing, coverage reporting               |
| Product Owner | Devesh   | Acceptance and review                     |
