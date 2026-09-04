# Expense Voucher Management System

A full-stack web application designed to digitize and streamline the lifecycle of employee expense vouchers — from creation and digital signature upload to director approval and accounting review.

---
# 🎥Demo Video
https://github.com/user-attachments/assets/e92bd78a-a905-4bac-b7ef-a9fa4b5e1c92

## Table of Contents

1. [Features & Role-Based Access](#features--role-based-access)
2. [Tech Stack](#tech-stack)
3. [Project Setup Instructions](#project-setup-instructions)
4. [Database Schema Explanation](#database-schema-explanation)
5. [API Documentation](#api-documentation)
6. [Assumptions Made During Development](#assumptions-made-during-development)
7. [Demo Credentials](#demo-credentials)
8. [Folder Structure](#folder-structure)

---

## Features & Role-Based Access

The system enforces strict role-based access control (RBAC) across three distinct user roles:

### 1. Employee
- **Create Vouchers**: Save as draft or attach a digital signature and submit for approval.
- **Manage Drafts**: Edit and delete vouchers while in `draft` state.
- **Upload Signature**: Upload image signature (PNG, JPG, etc.) for voucher authorization.
- **Track Status**: Real-time status visibility (`draft`, `submitted`, `approved`, `rejected`).
- **Data Isolation**: Employees can only view and access their own vouchers.

### 2. Director
- **Pending Approvals**: Dedicated dashboard view for vouchers awaiting review.
- **Director Signature**: Dedicated signature profile management to sign approvals.
- **Approve**: Approve submitted vouchers with timestamp and digital signature attached.
- **Reject with Reason**: Mandatory rejection reason input recorded and visible to employee.
- **Company-Wide View**: View all employee submissions across departments.

### 3. Accounts Team
- **Audit & Review**: Read-only oversight of all vouchers across the company.
- **Search & Filtering**: Filter by status, category, date range, min/max amount, or search by title / voucher number.
- **Financial Analytics**: Dashboard metrics on total expenditure, pending amounts, and status distributions.
- **Signature Inspection**: Verify both employee and director signatures on submitted/approved vouchers.

---

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database & ORM**: MySQL, Sequelize ORM (with automatic schema synchronization via `sequelize.sync({ alter: true })`)
- **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` password hashing
- **File Uploads**: `multer` with file extension and MIME type validation
- **Frontend**: React (Hooks, Context API for state management)
- **Routing**: React Router v6
- **Styling**: Tailwind CSS, React Icons
- **Charts & UI**: Recharts, React Hot Toast

---

## Project Setup Instructions

### Prerequisites
- **Node.js**: v16.x or higher
- **npm**: v8.x or higher
- **MySQL**: v5.7+ or v8.0+ running locally or on a server

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/hardik-j0001/expense-voucher-system.git
cd expense-voucher-system
```

---

### Step 2: Database Setup
1. Open your MySQL client (MySQL Workbench, phpMyAdmin, or terminal CLI):
```sql
CREATE DATABASE expense_voucher_db;
```
*(Alternatively, you can import the provided [backend/schema.sql](file:///backend/schema.sql) file directly).*

---

### Step 3: Backend Setup
1. Navigate to the backend directory:
```bash
cd backend
```
2. Install dependencies:
```bash
npm install
```
3. Create your `.env` file from the provided example:
```bash
cp .env.example .env
```
4. Configure your `.env` file with your MySQL credentials:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=expense_voucher_db
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
```
5. Seed initial demo users:
```bash
npm run seed
```
6. Start the backend development server:
```bash
npm run dev
```
Backend will run at **http://localhost:5000**.

---

### Step 4: Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```
2. Install dependencies:
```bash
npm install
```
3. Start the React development server:
```bash
npm start
```
Frontend will launch automatically at **http://localhost:3000**.

---

## Database Schema Explanation

The application schema is modeled in Sequelize ORM (`backend/src/models/`) and mirrored in raw SQL format in [`backend/schema.sql`](file:///backend/schema.sql).

### Entity Relationship Diagram (ERD) Overview

```
 +------------------+              +--------------------+
 |      Users       | 1          * |      Vouchers      |
 +------------------+--------------+--------------------+
 | id (PK)          |              | id (PK)            |
 | email (UNIQUE)   |              | voucherNumber (UNQ)|
 | password (HASHED)|              | employeeId (FK)    |
 | role (ENUM)      |              | directorId (FK)    |
 | department       |              | amount             |
 | signature        |              | status (ENUM)      |
 +------------------+              +--------------------+
```

### Table 1: `Users`
Stores account and authentication details for employees, directors, and accounts staff.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| `name` | VARCHAR(255) | NOT NULL | Full name of the user |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | User email address used for login |
| `password` | VARCHAR(255) | NOT NULL | Bcyrpt-hashed password string |
| `role` | ENUM | NOT NULL, DEFAULT `'employee'` | User role: `'employee'`, `'director'`, or `'accounts'` |
| `department` | VARCHAR(255) | NULLABLE | Department name (e.g., IT, Sales, Operations) |
| `signature` | VARCHAR(255) | NULLABLE | File path of director's stored digital signature |
| `isActive` | BOOLEAN | DEFAULT `TRUE` | Soft-delete / account status flag |
| `createdAt` | DATETIME | NOT NULL | Record creation timestamp |
| `updatedAt` | DATETIME | NOT NULL | Record last update timestamp |

### Table 2: `Vouchers`
Stores expense voucher details, workflow progression, and authorization signatures.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique voucher identifier |
| `voucherNumber` | VARCHAR(255) | NOT NULL, UNIQUE | Auto-generated code (format: `VOUCH-YYYY-####`) |
| `title` | VARCHAR(255) | NOT NULL | Short title or summary of expense |
| `description` | TEXT | NULLABLE | Detailed description / justification |
| `department` | VARCHAR(255) | NOT NULL | Department for which expense was incurred |
| `expenseDate` | DATETIME | NOT NULL | Date when the expense occurred |
| `amount` | DECIMAL(10,2) | NOT NULL, MIN >= 0.01 | Total monetary amount in INR (₹) |
| `category` | VARCHAR(255) | NULLABLE | Expense category (e.g., Travel, Meals, Supplies) |
| `status` | ENUM | NOT NULL, DEFAULT `'draft'` | Workflow status: `'draft'`, `'submitted'`, `'approved'`, `'rejected'` |
| `employeeSignature`| VARCHAR(255) | NULLABLE | Uploaded signature image path from employee |
| `directorSignature`| VARCHAR(255) | NULLABLE | Uploaded signature image path from approving director |
| `rejectionReason` | TEXT | NULLABLE | Reason provided by director if rejected |
| `approvalDate` | DATETIME | NULLABLE | Timestamp of director approval/rejection |
| `employeeId` | INTEGER | NOT NULL, FOREIGN KEY | References `Users.id` (Author) |
| `directorId` | INTEGER | NULLABLE, FOREIGN KEY | References `Users.id` (Approver) |
| `createdAt` | DATETIME | NOT NULL | Record creation timestamp |
| `updatedAt` | DATETIME | NOT NULL | Record last update timestamp |

### Schema Relationships
1. **User - Employee Vouchers** (`User.hasMany(Voucher, as: 'employeeVouchers')`): A user can author multiple vouchers. Deleting a user cascades or prevents orphan vouchers.
2. **User - Director Approvals** (`User.hasMany(Voucher, as: 'directorVouchers')`): A director can review and sign multiple vouchers.

---

## API Documentation

All API endpoints are prefixed with `/api`. Protected routes require an `Authorization: Bearer <token>` header.

### Authentication Endpoints (`/api/auth`)

#### 1. Register
- **Endpoint**: `POST /api/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "role": "employee",
  "department": "Engineering"
}
```
- **Success Response (201)**:
```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": { "id": 1, "name": "Jane Doe", "email": "jane@example.com", "role": "employee", "department": "Engineering" }
}
```

#### 2. Login
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "employee@demo.com",
  "password": "password123"
}
```
- **Success Response (200)**:
```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": { "id": 1, "name": "Demo Employee", "email": "employee@demo.com", "role": "employee", "department": "IT" }
}
```

#### 3. Current User Profile
- **Endpoint**: `GET /api/auth/me`
- **Access**: Authenticated (`Bearer <token>`)
- **Success Response (200)**: Returns logged-in user profile details.

---

### Voucher Endpoints (`/api/vouchers`)

#### 1. List Vouchers
- **Endpoint**: `GET /api/vouchers`
- **Access**: Authenticated (Employees receive only their own vouchers; Directors & Accounts receive all vouchers)
- **Query Parameters**:
  - `status`: Filter by `draft`, `submitted`, `approved`, `rejected`
  - `category`: String search filter
  - `startDate`, `endDate`: Date range filter (`YYYY-MM-DD`)
  - `minAmount`, `maxAmount`: Numeric range filter
  - `search`: Full text search on `title` and `voucherNumber`
  - `limit`: Integer limit for recent vouchers
- **Success Response (200)**:
```json
{
  "success": true,
  "count": 5,
  "vouchers": [ ... ]
}
```

#### 2. Get Single Voucher
- **Endpoint**: `GET /api/vouchers/:id`
- **Access**: Authenticated (Employee can only view their own; Director & Accounts can view any)

#### 3. Create Voucher (Draft)
- **Endpoint**: `POST /api/vouchers`
- **Access**: Authenticated (`employee`)
- **Request Body**:
```json
{
  "title": "Client Lunch Meeting",
  "description": "Lunch meeting with prospective client",
  "department": "Sales",
  "expenseDate": "2026-09-03",
  "amount": 1450.00,
  "category": "Meals"
}
```
- **Success Response (201)**: Returns created voucher with auto-assigned `voucherNumber` and `draft` status.

#### 4. Update Voucher
- **Endpoint**: `PUT /api/vouchers/:id`
- **Access**: Authenticated (Author only; voucher must be in `draft` status)

#### 5. Delete Voucher
- **Endpoint**: `DELETE /api/vouchers/:id`
- **Access**: Authenticated (Author only; voucher must be in `draft` status)

#### 6. Upload Employee Signature
- **Endpoint**: `POST /api/vouchers/:id/signature`
- **Access**: Authenticated (Author only; voucher must be in `draft` status)
- **Content-Type**: `multipart/form-data` (`signature` file field)

#### 7. Submit Voucher
- **Endpoint**: `POST /api/vouchers/:id/submit`
- **Access**: Authenticated (Author only; requires employee signature to be uploaded first)
- **Effect**: Changes status from `draft` to `submitted`.

#### 8. Director Signature Upload
- **Endpoint**: `POST /api/vouchers/director/signature`
- **Access**: Authenticated (`director` role only)
- **Content-Type**: `multipart/form-data` (`signature` file field)
- **Effect**: Updates director's stored digital signature.

#### 9. Approve Voucher
- **Endpoint**: `POST /api/vouchers/:id/approve`
- **Access**: Authenticated (`director` role only)
- **Effect**: Sets status to `approved`, attaches director signature and current approval timestamp.

#### 10. Reject Voucher
- **Endpoint**: `POST /api/vouchers/:id/reject`
- **Access**: Authenticated (`director` role only)
- **Request Body**:
```json
{
  "rejectionReason": "Missing itemized tax receipts for meal expense"
}
```
- **Effect**: Sets status to `rejected`, stores rejection reason and timestamp.

#### 11. Dashboard Analytics
- **Endpoint**: `GET /api/vouchers/dashboard`
- **Access**: Authenticated
- **Success Response (200)**:
```json
{
  "success": true,
  "stats": {
    "total": 12,
    "draft": 2,
    "submitted": 3,
    "approved": 6,
    "rejected": 1,
    "totalAmount": 45200.00,
    "pendingApproval": 3,
    "approvedToday": 1,
    "rejectedToday": 0,
    "pendingAmount": 12400.00
  }
}
```

---

## Assumptions Made During Development

1. **Voucher Lifecycle Immutability**: Once submitted, a voucher cannot be edited or deleted by the employee unless rejected or reset. Once approved or rejected by a director, the status is final to ensure audit integrity.
2. **Signature Prerequisite for Submission**: An employee must attach their digital signature image before submitting a voucher. This prevents unverified submissions from entering the approval pipeline.
3. **Single-Director Approval Model**: Any user with the `director` role has authority to approve or reject submitted vouchers. Multi-tier or sequential approvals were assumed out of scope for this version.
4. **Pre-Saved Director Signature**: To streamline high-volume approvals, a director uploads their signature once to their profile. Upon clicking "Approve", the director's signature is automatically applied with the approval timestamp.
5. **Accounts Role as Audit Observer**: The accounts team has comprehensive view, search, and analytics access across all vouchers, but does not modify approval decisions or alter voucher records.
6. **Voucher Number Sequencing**: Voucher numbers follow an automated yearly sequential format (`VOUCH-YYYY-####`) generated atomically at draft creation.
7. **Local Storage of Media**: Signatures are validated for image MIME types (JPG, PNG, GIF) and stored on the local server filesystem under `/uploads/signatures/`, referenced via URI paths in the database.
8. **Currency**: All monetary values are processed and displayed in Indian Rupees (INR - ₹) with standard 2 decimal precision.

---

## Demo Credentials

You can use the seeded demo accounts to test each role's distinct workflow:

| Role | Email | Password | Allowed Capabilities |
|---|---|---|---|
| **Employee** | `employee@demo.com` | `password123` | Create, edit, sign, and submit own vouchers |
| **Director** | `director@demo.com` | `password123` | Manage signature profile, approve/reject pending vouchers |
| **Accounts** | `accounts@demo.com` | `password123` | Full audit view, search/filters, financial dashboard |

---

## Folder Structure

```
expense-voucher-system/
├── .env.example                  # Root environment template
├── .gitignore                    # Git ignore configuration
├── README.md                     # Comprehensive project documentation
├── backend/
│   ├── .env.example              # Backend environment template
│   ├── package.json              # Backend dependencies and scripts
│   ├── schema.sql                # Raw MySQL database schema file
│   ├── seed.js                   # Demo users seed script
│   ├── server.js                 # Express application entry point
│   ├── uploads/
│   │   └── signatures/           # Uploaded signature files storage
│   └── src/
│       ├── config/               # Database connection configuration
│       ├── controllers/          # Auth and voucher business logic
│       ├── middleware/           # JWT auth and Multer upload middleware
│       ├── models/               # Sequelize User and Voucher models
│       ├── routes/               # API route definitions
│       └── utils/                # Helper utilities (voucher number generator)
└── frontend/
    ├── package.json              # Frontend dependencies and scripts
    ├── tailwind.config.js        # Tailwind CSS configuration
    ├── public/                   # Static HTML templates
    └── src/
        ├── App.js                # App route definitions and ProtectedRoute
        ├── index.css             # Tailwind imports and base styles
        ├── index.js              # React DOM entry point
        ├── components/           # Reusable UI components (Layout, Navbar)
        ├── context/              # AuthContext & state provider
        ├── pages/                # Views: Dashboard, VoucherForm, VoucherList, etc.
        └── services/             # Axios API service client with interceptors
```
