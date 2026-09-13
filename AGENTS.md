# AUREX Clinical Exercise Management System — Admin Only
# AGENTS.md — Master Build Specification & System Guidelines

## Project Overview
Full-stack, secure internal operations platform for AUREX — a medical fitness, clinical exercise physiology, and active rehabilitation centre.
- **Audience**: Private internal tool only.
- **Constraints**: No client-facing features, no public signup, no client portal.

## Tech Stack
- **Framework**: Next.js 14+ (App Router, Server Actions, Route Handlers)
- **Styling**: Tailwind CSS + Lucide Icons + Radix UI primitives
- **Theme**: Clinical Luxury Dark/Light (Deep Navy / Clinical Slate / Emerald / Warm Gold accents)
- **Database**: Prisma ORM — SQLite (local dev) / PostgreSQL (production) toggleable via `.env`
- **Auth**: NextAuth.js with strict role-based access control (RBAC)
- **Email**: Resend API + mock console delivery logger for local dev
- **Hosting**: Railway

---

## RBAC Matrix — Strict Role Enforcement

| Feature | OWNER | MANAGER | RECEPTIONIST |
|---|:---:|:---:|:---:|
| Command Center Dashboard | Full | Full | Financial cards masked |
| Follow-ups & Irregular Clients | Full | Full | Full |
| Birthdays & Anniversaries | Full | Full | Full |
| Today's Schedule & Attendance | Full | Full | Full |
| Clients 360° Profile | Full | Full | Operational only |
| Booking Engine & Sessions | Full | Full | Full |
| Payment Logging & Invoicing | Full | Full | Log only |
| Revenue & Ledger Analytics | Full | Full | **BLOCKED (HTTP 403)** |
| Reports & BI Analytics | Full | Full | **BLOCKED (HTTP 403)** |
| Master Package Pricing | Full | Full | Read-only catalog |
| Staff & Specialists Management | Full | Full (no deletion) | **BLOCKED** |

All BLOCKED routes return HTTP 403 server-side.
Hidden in UI AND protected at API level — not just CSS hidden.

---

## Database Schema (Prisma)

### Enums
- **Role**: `OWNER`, `MANAGER`, `RECEPTIONIST`
- **ClientStatus**: `LEAD`, `CONSULTATION`, `ASSESSMENT_BOOKED`, `ACTIVE`, `INACTIVE`, `ON_HOLD`, `EXPIRED`, `COMPLETED`
- **ServiceType**: `SEMI_PRIVATE`, `PREMIUM`, `ASSESSMENT`, `CONSULTATION`
- **BookingStatus**: `CONFIRMED`, `CANCELLED`, `RESCHEDULED`, `COMPLETED`
- **AttendanceStatus**: `PENDING`, `PRESENT`, `ABSENT`, `CANCELLED`, `RESCHEDULED`, `NO_SHOW`
- **PackageStatus**: `ACTIVE`, `EXPIRED`, `COMPLETED`, `ON_HOLD`
- **PaymentMethod**: `UPI`, `BANK_TRANSFER`, `CARD`, `CASH`
- **PaymentStatus**: `PAID`, `PARTIAL`, `PENDING`, `REFUNDED`
- **LeadStage**: `NEW_LEAD`, `CONTACTED`, `CONSULTATION`, `ASSESSMENT_BOOKED`, `ASSESSMENT_COMPLETED`, `PACKAGE_OFFERED`, `CONVERTED`, `ACTIVE`, `RENEWAL`, `LOST`

### Models
1. `User` — id, name, email, passwordHash, role, phone, active
2. `Specialist` — id, name, email, phone, specialization, bio, active, colorCode
3. `Client` — id, clientId (AUR-YYYY-XXXX unique), name, phone, email, dob, gender, address, emergencyContact, registrationDate, referralSource, status, assignedSpecialistId
4. `Package` (master catalog) — id, name, serviceType, sessionCount, price, validityDays, active
5. `ClientPackage` — id, clientId, packageId, name, serviceType, totalSessions, sessionsUsed, sessionsRemaining, pricePaid, balanceRemaining, startDate, expiryDate, status
6. `Session` — id, title, date, startTime, endTime, serviceType, specialistId, maxCapacity, currentCapacity, status, notes
7. `Booking` — id, sessionId, clientId, clientPackageId, status, bookedAt
8. `Attendance` — id, bookingId, sessionId, clientId, status, markedAt, markedByUserId, notes
9. `Payment` — id, clientId, clientPackageId, amount, balanceRemaining, paymentDate, paymentMethod, invoiceNumber, status, notes, isRefund
10. `Assessment` — id, clientId, specialistId, type (INITIAL, REASSESSMENT, PROGRESS_REVIEW), date, healthScreening, medicalHistory, goals, baselineMetrics, functionalMovement, cardioStrength, clinicalNotes
11. `Lead` — id, name, phone, email, stage, source, notes, assignedToUserId, convertedClientId, createdAt
12. `FollowUp` — id, leadId, clientId, type, notes, followUpDate, completed, loggedByUserId
13. `Note` — id, clientId, content, category, authorId, createdAt

---

## Left Sidebar Navigation

### Design
- Fixed left, always visible, sticky viewport
- Expanded: 240px — icons + labels + badges + user info
- Collapsed: 64px — icon-only + hover tooltips
- Toggle: ChevronLeft / ChevronRight top-right of sidebar
- Active: `bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold`
- Hover: `hover:bg-slate-800/80`
- Header: "QUICK MANAGE" uppercase gray + live status dot
- Bottom: user name, email, role badge, role switcher, sign-out button

### Quick Manage Items (exact order)
1. **Follow-ups** (`PhoneCall`) $\rightarrow$ `/dashboard/follow-ups`
2. **Pending Leads** (`Clock`) $\rightarrow$ `/dashboard/crm`
3. **Pending Payments** (`Wallet`) $\rightarrow$ `/dashboard/payments`
4. **Upcoming Renewals** (`RefreshCw`) $\rightarrow$ `/dashboard/renewals`
5. **Irregular Clients** (`AlertTriangle`) $\rightarrow$ `/dashboard/irregular`
6. **Client Birthdays** (`Cake`) $\rightarrow$ `/dashboard/birthdays`
7. **Membership Anniversary** (`Award`) $\rightarrow$ `/dashboard/anniversaries`
8. **Today's Schedule** (`CalendarDays`) $\rightarrow$ `/dashboard/bookings`
9. **AUREX Dashboard** (`LayoutDashboard`) $\rightarrow$ `/dashboard`

### Secondary Clinical Operations (collapsible submenu)
- `All Clients (360°)` $\rightarrow$ `/dashboard/clients`
- `Live Attendance` $\rightarrow$ `/dashboard/attendance`
- `Packages Catalog` $\rightarrow$ `/dashboard/packages`
- `Specialists Roster` $\rightarrow$ `/dashboard/specialists`
- `Clinical Assessments` $\rightarrow$ `/dashboard/assessments`
- `Reports & Analytics` $\rightarrow$ `/dashboard/reports` (OWNER+MANAGER only)

---

## Dashboard — Main Command Center (/dashboard)

- **Top Alert Banner**: Portal leads indicator with scrollable chips and review button.
- **Date Filter Bar**: `From` and `To` date pickers with presets (`Today`, `Last 7 Days`, `This Month`) filtering financial stats.
- **Quick Actions Bar**: `+ Quick Book`, `+ New Client`, `+ Log Payment`, `+ New Lead`.
- **4×4 Summary Statistics Grid**:
  - Row 1: New Clients (Green) • Total Collection (Purple) • Total Expenses (Red) • Premium Collection (Yellow)
  - Row 2: Profit / Loss (Orange) • Pending Leads (Green) • Active Clients (Blue) • Inactive Clients (Yellow)
  - Row 3: Profiles Created (Blue) • Semi-Private Booked (Purple) • Premium Booked (Green) • Present Today (Blue)
  - Row 4: Slot Availability (Teal) • Semi-Private Booked (Purple) • Premium Booked (Green) • Follow-ups (Rose)
  - *All financial cards hidden for RECEPTIONIST.*
- **New Clients Section**: Displays registrations for today with click-to-open 360° profile modals.
- **Group Section (Today's Sessions)**: Displays session slots for today with capacity progress bars (`3/4` or `4/4 FULL`), inline attendance buttons (`Present`, `Absent`, `No-show`), and atomic session completion.

---

## Core Engine & Business Logic Rules

1. **Capacity Enforcement**:
   - `SEMI_PRIVATE`: Max 4 clients
   - `PREMIUM`: Max 1 client
   - `ASSESSMENT` / `CONSULTATION`: Max 1 client
   - Overbooking rejected with **HTTP 409 Conflict**.
2. **Atomic Session Completion**:
   - Marking a session `COMPLETE` atomically decrements `sessionsRemaining` for all attending clients.
   - When `sessionsRemaining === 0`, package status automatically marks `COMPLETED`.
3. **Critical Test Case (Puneesh AUR-2026-0001)**:
   - Initial Assessment with McGill Big 3 prescription
   - 12-Session Semi-Private package assigned
   - Payment recorded with invoice `INV-AUR-2026-0001`
   - Booked into 8:00 AM session (1/4 capacity)
   - Capacity enforced at 4 clients (5th client rejected with HTTP 409)
   - Marked `PRESENT` $\rightarrow$ Complete Session $\rightarrow$ atomic decrement: **12 $\rightarrow$ 11 sessionsRemaining**
   - Permanent attendance timestamp logged and reflected in *Present Today* stats.

---

## Seed Data (npm run prisma:seed)

- **Owner**: `owner@aurex.com` / `AurexOwner@2026` / `OWNER`
- **Manager**: `manager@aurex.com` / `AurexManager@2026` / `MANAGER`
- **Receptionist**: `receptionist@aurex.com` / `AurexRecp@2026` / `RECEPTIONIST`
- 3 Specialists (Dr. Raghav Mehta, Priya Sharma, Dr. Arjun Verma)
- 4 Master Packages (Semi-Private 12 & 24, Premium 12, Assessment)
- Sample Clients (including Puneesh `AUR-2026-0001`, Sneha Patel `AUR-2026-0004`, etc.)
- Sample Sessions, Bookings, Attendances, Leads, and Follow-ups
