# 🧪 Complete Testing Guide - Tutor-Tribe Application

This guide will help you test and verify that everything is working properly in the Peer-to-Peer Tutoring Scheduler application.

---

## 📋 Prerequisites

1. **Node.js and npm installed** (check with `node --version` and `npm --version`)
2. **Dependencies installed** in both backend and frontend folders
3. **Two terminal windows** - one for backend, one for frontend

---

## 🚀 Step 1: Start the Servers

### **Terminal 1 - Backend Server**

```bash
# Navigate to backend folder
cd backend

# Install dependencies (if not already done)
npm install

# Start the backend server
npm start
```

**Expected Output:**
```
Seeded test user: teststudent@pesu.pes.edu / password123 (role: student)
Seeded test user: testtutor@pesu.pes.edu / password123 (role: tutor)
Seeded test user: testadmin@pesu.pes.edu / password123 (role: admin)
Backend running on http://localhost:4000
```

**Server should be running on:** `http://localhost:4000`

---

### **Terminal 2 - Frontend Server**

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies (if not already done)
npm install

# Start the frontend server
npm start
```

**Expected Output:**
```
Compiled successfully!
You can now view frontend in the browser.
  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

**Frontend should automatically open in browser at:** `http://localhost:3000`

---

## ✅ Step 2: Test Backend Health Check

Open a new terminal or use your browser/Postman:

```bash
# Test health endpoint
curl http://localhost:4000/health
```

**Expected Response:**
```json
{"status":"ok"}
```

---

## 🔐 Step 3: Test Authentication (Story A1)

### **3.1 Test Login - Student**

```bash
curl -X POST http://localhost:4000/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "password",
    "username": "teststudent@pesu.pes.edu",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "token_type": "Bearer",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 1800,
  "scope": "read write",
  "user": {
    "id": 1,
    "username": "teststudent@pesu.pes.edu",
    "role": "student"
  }
}
```

**Save the `access_token` - you'll need it for the next tests!**

---

### **3.2 Test Login - Tutor**

```bash
curl -X POST http://localhost:4000/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "password",
    "username": "testtutor@pesu.pes.edu",
    "password": "password123"
  }'
```

**Save the tutor's `access_token`**

---

### **3.3 Test Login - Admin**

```bash
curl -X POST http://localhost:4000/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "password",
    "username": "testadmin@pesu.pes.edu",
    "password": "password123"
  }'
```

**Save the admin's `access_token`**

---

### **3.4 Test Invalid Login**

```bash
# Wrong password
curl -X POST http://localhost:4000/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "password",
    "username": "teststudent@pesu.pes.edu",
    "password": "wrongpassword"
  }'
```

**Expected Response:** 401 Unauthorized

```bash
# Non-PESU email
curl -X POST http://localhost:4000/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "password",
    "username": "user@gmail.com",
    "password": "password123"
  }'
```

**Expected Response:** 400 Bad Request with error about PESU email

---

## 🛡️ Step 4: Test Role-Based Access Control (Story A2)

Replace `<STUDENT_TOKEN>`, `<TUTOR_TOKEN>`, and `<ADMIN_TOKEN>` with the actual tokens you got from Step 3.

### **4.1 Student Role Tests**

#### ✅ Test: Student can view available slots (public route)
```bash
curl -X GET http://localhost:4000/api/slots/available \
  -H "Authorization: Bearer <STUDENT_TOKEN>"
```

**Expected:** 200 OK with slots data

---

#### ✅ Test: Student can book slots
```bash
curl -X POST http://localhost:4000/api/slots/book \
  -H "Authorization: Bearer <STUDENT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"slotId": 1}'
```

**Expected:** 200 OK with booking confirmation

---

#### ❌ Test: Student CANNOT create slots (should fail)
```bash
curl -X POST http://localhost:4000/api/slots/create \
  -H "Authorization: Bearer <STUDENT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"time": "2025-11-03 10:00", "subject": "Math"}'
```

**Expected:** 403 Forbidden
```json
{
  "error": "forbidden",
  "error_description": "Access denied. Required role(s): tutor. Your role: student"
}
```

---

#### ❌ Test: Student CANNOT access admin routes (should fail)
```bash
curl -X GET http://localhost:4000/api/admin/users \
  -H "Authorization: Bearer <STUDENT_TOKEN>"
```

**Expected:** 403 Forbidden

---

### **4.2 Tutor Role Tests**

#### ✅ Test: Tutor can view available slots
```bash
curl -X GET http://localhost:4000/api/slots/available \
  -H "Authorization: Bearer <TUTOR_TOKEN>"
```

**Expected:** 200 OK

---

#### ✅ Test: Tutor can create slots
```bash
curl -X POST http://localhost:4000/api/slots/create \
  -H "Authorization: Bearer <TUTOR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"time": "2025-11-03 15:00", "subject": "Physics"}'
```

**Expected:** 200 OK with slot creation confirmation

---

#### ✅ Test: Tutor can edit slots
```bash
curl -X PUT http://localhost:4000/api/slots/edit/1 \
  -H "Authorization: Bearer <TUTOR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"time": "2025-11-03 16:00", "subject": "Chemistry"}'
```

**Expected:** 200 OK with update confirmation

---

#### ❌ Test: Tutor CANNOT book slots (should fail)
```bash
curl -X POST http://localhost:4000/api/slots/book \
  -H "Authorization: Bearer <TUTOR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"slotId": 1}'
```

**Expected:** 403 Forbidden

---

### **4.3 Admin Role Tests**

#### ✅ Test: Admin can view all users
```bash
curl -X GET http://localhost:4000/api/admin/users \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Expected:** 200 OK with users list

---

#### ✅ Test: Admin can view all bookings
```bash
curl -X GET http://localhost:4000/api/admin/bookings \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Expected:** 200 OK with bookings list

---

#### ✅ Test: Admin can view user profile
```bash
curl -X GET http://localhost:4000/api/admin/users/1 \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Expected:** 200 OK with user profile

---

### **4.4 Unauthenticated Access Tests**

#### ❌ Test: Access without token (should fail)
```bash
curl -X POST http://localhost:4000/api/slots/book \
  -H "Content-Type: application/json" \
  -d '{"slotId": 1}'
```

**Expected:** 401 Unauthorized
```json
{
  "error": "unauthorized",
  "error_description": "Missing or invalid authorization header. Expected: Bearer <token>"
}
```

---

#### ❌ Test: Access with invalid token (should fail)
```bash
curl -X POST http://localhost:4000/api/slots/book \
  -H "Authorization: Bearer invalid_token_123" \
  -H "Content-Type: application/json" \
  -d '{"slotId": 1}'
```

**Expected:** 401 Unauthorized

---

## 🧪 Step 5: Run Automated Tests

### **5.1 Run All Backend Tests**

```bash
cd backend
npm test
```

**Expected Output:**
```
PASS  tests/auth.test.js
PASS  tests/rbac.test.js

Test Suites: 2 passed, 2 total
Tests:       X passed, X total
```

---

### **5.2 Run Specific Test Suites**

```bash
# Test authentication only
npm test -- auth.test.js

# Test RBAC only
npm test -- rbac.test.js
```

---

### **5.3 Run Tests with Coverage**

```bash
cd backend
npm test -- --coverage
```

This will show code coverage statistics.

---

## 🌐 Step 6: Test Frontend UI

### **6.1 Open Login Page**

1. Open browser to `http://localhost:3000`
2. You should see the login form

---

### **6.2 Test Login Functionality**

1. **Test Valid Login:**
   - Username: `teststudent@pesu.pes.edu`
   - Password: `password123`
   - Click "Login"
   - **Expected:** Success message showing "Login successful: teststudent@pesu.pes.edu"

2. **Test Invalid Login:**
   - Username: `teststudent@pesu.pes.edu`
   - Password: `wrongpassword`
   - Click "Login"
   - **Expected:** Error message showing "Error: Invalid credentials"

3. **Test Non-PESU Email:**
   - Username: `user@gmail.com`
   - Password: `password123`
   - Click "Login"
   - **Expected:** Error message about PESU email requirement

---

### **6.3 Check Browser Console**

Open browser Developer Tools (F12) and check:
- **Console tab:** Should show no errors
- **Network tab:** Check API calls to `/api/auth/token`

---

### **6.4 Check LocalStorage**

After successful login, check browser DevTools > Application > Local Storage:
- `access_token`: Should contain JWT token
- `user`: Should contain user object with role

---

## 📊 Step 7: Quick Test Checklist

Use this checklist to verify everything works:

### ✅ Backend Tests
- [ ] Backend server starts without errors
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Student can login and get token
- [ ] Tutor can login and get token
- [ ] Admin can login and get token
- [ ] Invalid credentials return 401
- [ ] Non-PESU email returns 400

### ✅ RBAC Tests
- [ ] Student can book slots
- [ ] Student CANNOT create slots (403)
- [ ] Student CANNOT access admin routes (403)
- [ ] Tutor can create/edit slots
- [ ] Tutor CANNOT book slots (403)
- [ ] Admin can access all admin routes
- [ ] Unauthenticated requests return 401

### ✅ Frontend Tests
- [ ] Frontend server starts without errors
- [ ] Login page loads correctly
- [ ] Valid login works
- [ ] Invalid login shows error
- [ ] Token stored in localStorage

### ✅ Automated Tests
- [ ] `npm test` passes all tests
- [ ] Test coverage is acceptable (>80%)

---

## 🐛 Troubleshooting

### **Issue: Backend server won't start**

**Check:**
1. Port 4000 is not in use: `netstat -ano | findstr :4000` (Windows)
2. Dependencies installed: `cd backend && npm install`
3. Database file exists: `backend/db.sqlite`

---

### **Issue: Frontend server won't start**

**Check:**
1. Port 3000 is not in use
2. Dependencies installed: `cd frontend && npm install`
3. Node version: Should be Node 14+ (check with `node --version`)

---

### **Issue: Tests fail**

**Check:**
1. Backend server is not running during tests (conflicts with test server)
2. Database file exists
3. All dependencies installed

---

### **Issue: 401 Unauthorized errors**

**Check:**
1. Token is included in Authorization header
2. Token format: `Bearer <token>` (with space)
3. Token hasn't expired (30 minutes for access tokens)
4. Token was generated for correct user

---

### **Issue: 403 Forbidden errors**

**Check:**
1. User has correct role for the endpoint
2. Token contains role information
3. Role matches requirements

---

## 📝 Using Postman for Testing

If you prefer a GUI tool:

1. **Import Collection:**
   - Create a new Collection in Postman
   - Add requests for each endpoint

2. **Set Environment Variables:**
   - Create Environment with variables:
     - `base_url`: `http://localhost:4000`
     - `student_token`: (from login response)
     - `tutor_token`: (from login response)
     - `admin_token`: (from login response)

3. **Test Flow:**
   - Login → Save token to environment
   - Use token in Authorization header for protected routes

---

## 🎯 Summary

After completing all steps, you should have verified:

1. ✅ Both servers running successfully
2. ✅ Authentication working (login with all 3 roles)
3. ✅ Role-based access control working correctly
4. ✅ Frontend UI functional
5. ✅ All automated tests passing

**Everything working? You're ready to continue development! 🚀**

---

## 📚 Additional Resources

- **API Documentation:** `backend/docs/API_Login.md` and `backend/docs/API_RBAC.md`
- **Test Files:** `backend/tests/auth.test.js` and `backend/tests/rbac.test.js`
- **Backend Code:** `backend/middleware/authMiddleware.js` for RBAC logic

