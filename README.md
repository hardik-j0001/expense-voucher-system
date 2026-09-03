# Expense Voucher Management System

A complete full-stack web application for managing employee expense vouchers digitally.

## Features

### Employee
- Create, edit, delete draft vouchers
- Upload signature image
- Submit vouchers for approval
- Track voucher status
- View own vouchers only

### Director
- View all vouchers
- Approve vouchers with signature
- Reject vouchers with reason
- View pending approvals

### Accounts Team
- View all vouchers
- Search, filter, sort vouchers
- View signatures and status

## Tech Stack

### Backend
- Node.js + Express
- JWT Authentication
- MySQL with Sequelize ORM
- Multer for file uploads

### Frontend
- React with Hooks
- React Router for navigation
- Tailwind CSS
- Recharts for charts
- React Hook Form

## Quick Start

### Prerequisites
- Node.js (v14+)
- MySQL

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your database credentials
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Seed Database
```bash
cd backend
npm run seed
```

## API Endpoints

### Auth
- POST /api/auth/register - Register user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

### Vouchers
- GET /api/vouchers - Get all vouchers
- GET /api/vouchers/:id - Get voucher details
- POST /api/vouchers - Create voucher
- PUT /api/vouchers/:id - Update voucher
- DELETE /api/vouchers/:id - Delete voucher
- POST /api/vouchers/:id/submit - Submit voucher
- POST /api/vouchers/:id/signature - Upload signature
- POST /api/vouchers/:id/approve - Approve voucher (Director)
- POST /api/vouchers/:id/reject - Reject voucher (Director)
- GET /api/vouchers/dashboard - Dashboard stats

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Employee | employee@demo.com | password123 |
| Director | director@demo.com | password123 |
| Accounts | accounts@demo.com | password123 |

## Database Schema

### Users
- id, name, email, password, role, department, signature, isActive, timestamps

### Vouchers
- id, voucherNumber, title, description, department, expenseDate, amount, category
- status (draft/submitted/approved/rejected)
- employeeSignature, directorSignature, rejectionReason, approvalDate
- employeeId, directorId, timestamps

## License

This project is confidential and proprietary to Prachay Securities Private Limited.