# Devlomatix Solutions / HealthyFine

A comprehensive, full-stack Hospital Management and Healthcare System built with [Next.js](https://nextjs.org/).

## 🚀 Tech Stack
- **Framework:** Next.js (App Router)
- **Database ORM:** Prisma
- **Authentication:** NextAuth.js (v4)
- **Styling:** Tailwind CSS & Radix UI / shadcn-ui
- **Database Storage:** Vercel Postgres / Supabase
- **Icons:** Lucide React

## 🛠 Getting Started (Local Development)

First, install the dependencies if you haven't recently:
```bash
npm install
```

Run the development server using Turbopack for faster reloads:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## ⚡ Deployment on Vercel (Important)

When deploying to Vercel, there are a few critical environment variables and configurations required, especially around Authentication:

### 1. NextAuth URL Configuration
Because NextAuth strictly enforces secure cookies (`__Secure-next-auth.session-token`) in production environments (HTTPS), you **must** configure these variables in your Vercel Project Settings for authentication to work (otherwise, Server Components using `getServerSession` will automatically redirect users to `/login`):
- `NEXTAUTH_URL` = `https://devlomatix.com` (Must include exactly `https://`)
- `NEXT_PUBLIC_URL` = `https://devlomatix.com`

*Note: If you use an `http://` prefix in Vercel, NextAuth will mismatch the secure cookie policy and users won't be able to stay logged in on server-rendered pages like `/workspace`.*

### 2. TypeScript Compilation bypass for Prototyping
If you are rapidly prototyping features (like `leads-v2`) and get Vercel build failures from strict TypeScript checks on UI components (e.g., missing children props on basic shadcn components built in JS), you can use `// @ts-nocheck` at the top of the specific problematic `tsx` component files to bypass the build blocker without abandoning type-safety everywhere else.

---

## 🗂 System Modules & Features

The platform is divided into robust, interdependent modules:

### 🏥 Core Clinical Modules
- **Patient Management:** Registration, medical records, history, prescriptions, and discharge summaries.
- **Billing & Insurance:** Invoice generation, payment processing, insurance claims, and financial reports.
- **Pharmacy Management:** Prescription tracking, drug dispensing, stock alerts, and medicine interactions.
- **Laboratory Management:** Test orders, sample tracking, results management, and equipment monitoring.

### ⚙️ Operational Modules
- **Ward/Bed Management:** Room allocation, bed availability, patient transfers, and occupancy tracking.
- **Staff/HR Management:** Doctor schedules, shift management, payroll, and performance tracking.
- **OPD/IPD Management:** Outpatient and inpatient workflows, admission/discharge processes.
- **Emergency/ER Management:** Triage system, ambulance tracking, and critical patient monitoring.

### 📊 Administrative Modules
- **Reports & Analytics Dashboard:** KPIs, revenue analysis, patient flow, and operational metrics.
- **Doctor/Specialist Directory:** Profiles, availability, specializations, and patient ratings.

### 🌟 Value-Add Features
- **Patient Portal:** Online booking, test results, prescriptions, and medical history access.
- **Telemedicine Integration:** Video consultations and remote monitoring.
- **Queue Management:** Token system and waiting time notifications.