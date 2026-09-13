# AUREX — Clinical Exercise Management System (Admin CMS)

A secure, high-performance internal clinical operations & exercise management platform for **AUREX** — a medical fitness, clinical exercise physiology, and active rehabilitation centre.

---

## 🌟 Key Features

### 1. Top Navigation Bar (Easy Software Standard)
- **Tabs**: Dashboard, Inquiry / CRM, Clients 360°, Billing & Payments, Packages Catalog, Attendance & Utilisation, Reports, Manage & Settings, Forms.
- **Role-Based Access Control (RBAC)**: Strict server-side and UI masking for Owner, Manager, and Receptionist roles.

### 2. Left Sidebar — Quick Manage
- Instant access with live count badges:
  1. Follow-ups (`PhoneCall`)
  2. Pending Inquiries (`Clock`)
  3. Pending Payments (`Wallet`)
  4. Upcoming Renewals (`RefreshCw`)
  5. Irregular Clients (`AlertTriangle`)
  6. Birthdays (`Cake`)
  7. Anniversary (`Award`)
  8. Today's Schedule (`CalendarDays`)
  9. Sports / AUREX Dashboard (`LayoutDashboard`)

### 3. Core Clinical Modules
- **Command Center Dashboard**: Live Portal Lead Chips banner, 4x4 Stat Grid with 40px circular badges, Slot Availability section, New Clients Today, and Group Sessions.
- **Inquiry & CRM Pipeline**: Two-column intake form, convertibility rating (`Hot`/`Warm`/`Cold`), quick response tags, follow-up timeline.
- **Clients 360° Profile**: Medical history, baseline vitals, active packages, session utilization, notes, and attendance audit logs.
- **Today's Schedule & Booking Engine**: Specialist roster columns, 30-min time rows, capacity enforcement (`4:1` Semi-Private, `1:1` Premium), and atomic session completion decrements.
- **Attendance & Utilisation Analytics**: Visual attendance trend charts and full-width 24-hour slot density heatmap.
- **Billing & Ledger**: Multi-method payments (UPI, Bank Transfer, Card, Cash), auto-generated invoices (`INV-AUR-YYYY-XXXX`), and refund tracking.
- **Clinical Assessment Forms**: Initial Clinical Intake, PAR-Q+ Screening, McGill Big 3 Lumbar Stability, FMS Screen, and printable medical PDF reports.

---

## 🛠 Tech Stack

- **Framework**: Next.js 14+ (App Router, Server Actions, Route Handlers)
- **Styling**: Tailwind CSS + Lucide Icons + Radix UI Primitives
- **Database**: Prisma ORM (SQLite for local dev / PostgreSQL for production via `.env`)
- **Authentication**: NextAuth.js with strict RBAC (`OWNER`, `MANAGER`, `RECEPTIONIST`)
- **Deployment**: Railway / Vercel ready

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database
```bash
npx prisma db push
npx prisma generate
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Default Staff Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Owner** | `owner@aurex.com` | `AurexOwner@2026` | Full Unrestricted Admin |
| **Manager** | `manager@aurex.com` | `AurexManager@2026` | Operations & Reports |
| **Receptionist** | `receptionist@aurex.com` | `AurexRecp@2026` | Front Desk (Financials & Reports Masked) |

---

## 📄 License
Private Internal Tool — Proprietary to AUREX.
