---
name: refunction-rehab-website
description: Build the full React + backend website/app for ReFunction Rehab physiotherapy center run by Dr. Neha Trivedi. Use this skill whenever the user wants to create, update, or extend any part of the ReFunction Rehab website — including the homepage, services pages, patient enrollment form, payment collection, contact features, doctor dashboard, database persistence, or any React component or backend route for this clinic. Triggers on any mention of ReFunction Rehab, Dr. Neha Trivedi's clinic website, physiotherapy center app, patient portal, doctor dashboard, or any feature described in this skill.
---

# ReFunction Rehab — Website & App Build Skill

A complete spec for building the full-stack website and patient management app for **ReFunction Rehab**, a physiotherapy and health exercise center led by Dr. Neha Trivedi.

---

## 1. Brand Identity

| Field | Value |
|---|---|
| **Clinic Name** | ReFunction Rehab |
| **Tagline** | Move Better. Feel Better. Live Better. |
| **Sub-taglines** | "Better Movement. Better Health. Better Life." / "Heal. Strengthen. Feel confident in your body again." |
| **Lead Doctor** | Dr. Neha Trivedi, PT, MPT |
| **Specialization** | Musculoskeletal & Sports Injury Specialist; trained in Prenatal & Postnatal Pilates |
| **Experience** | 15+ Years |
| **Phone** | 99009 11795 |
| **WhatsApp** | 99009 11795 |
| **Patient Enrollment** | Direct in-app multi-step form (Google Form removed) |

### Color Palette
```css
:root {
  --brand-navy:    #1B2F5E;   /* primary dark navy */
  --brand-teal:    #1A7F8E;   /* teal/cyan accent */
  --brand-orange:  #E8630A;   /* warm orange CTA */
  --brand-gold:    #F5A623;   /* gold highlight */
  --brand-green:   #4CAF50;   /* success / check marks */
  --brand-light:   #F0F6FA;   /* off-white background */
  --brand-white:   #FFFFFF;
  --brand-text:    #1A1A2E;   /* dark text */
  --brand-muted:   #6B7280;   /* secondary text */
}
```

### Typography
- **Display / Headings**: `Playfair Display` (Google Fonts) — authoritative, medical-professional feel
- **Body / UI**: `DM Sans` (Google Fonts) — clean, modern legibility
- **Accent numbers / stats**: `Oswald` — bold impact for "15+ Years", phone numbers

### Logo Usage
- Text logo: **Re**Function Rehab (with "Re" in teal `#1A7F8E`, "Function Rehab" in navy `#1B2F5E`)
- Icon: Stylized running/movement figure (SVG inline, matches brand images)

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| **Frontend** | React 18 + Vite |
| **Styling** | Tailwind CSS + custom CSS variables |
| **Routing** | React Router v6 |
| **Forms** | React Hook Form + Zod validation |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Backend** | Node.js + Express |
| **Database** | PostgreSQL 16 — pulled from Docker Hub (`postgres:16-alpine`), no local install needed |
| **ORM** | Prisma ORM — schema-first, type-safe DB access |
| **Container Orchestration** | Docker Compose (local dev) — single `docker-compose up` starts everything |
| **Payments** | Razorpay (UPI, cards, net banking, EMI) |
| **Email** | Nodemailer (SMTP / SendGrid) |
| **File Storage** | Cloudinary (for patient documents) |
| **Auth** | JWT + bcrypt (staff/admin login) |

### Database via Docker (No Local Installation Required)

**CRITICAL RULE**: PostgreSQL must NEVER require a manual local installation. It is always run via Docker using the official image from Docker Hub. This makes the project work identically on any developer machine or cloud VM.

**`docker-compose.yml`** (at project root):
```yaml
version: '3.9'

services:
  db:
    image: postgres:16-alpine
    container_name: refunction_db
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER:-refunction}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-rehab_secret}
      POSTGRES_DB: ${DB_NAME:-refunction_rehab}
    ports:
      - "${DB_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-refunction}"]
      interval: 10s
      timeout: 5s
      retries: 5

  server:
    build: ./server
    container_name: refunction_server
    restart: always
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://${DB_USER:-refunction}:${DB_PASSWORD:-rehab_secret}@db:5432/${DB_NAME:-refunction_rehab}
      JWT_SECRET: ${JWT_SECRET}
      RAZORPAY_KEY_ID: ${RAZORPAY_KEY_ID}
      RAZORPAY_KEY_SECRET: ${RAZORPAY_KEY_SECRET}
      SMTP_HOST: ${SMTP_HOST}
      SMTP_USER: ${SMTP_USER}
      SMTP_PASS: ${SMTP_PASS}
      CLOUDINARY_URL: ${CLOUDINARY_URL}
      PORT: 4000
    ports:
      - "4000:4000"

  client:
    build: ./client
    container_name: refunction_client
    restart: always
    depends_on:
      - server
    ports:
      - "80:80"

volumes:
  postgres_data:
```

**`server/Dockerfile`**:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && node index.js"]
```

**`client/Dockerfile`** (production):
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

**`client/nginx.conf`**:
```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api/ {
    proxy_pass http://server:4000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

**`.env.example`** (at project root — copy to `.env` and fill in secrets):
```env
# Database (used by Docker Compose)
DB_USER=refunction
DB_PASSWORD=rehab_secret
DB_NAME=refunction_rehab
DB_PORT=5432

# Set automatically by Docker Compose for the server container
DATABASE_URL=postgresql://refunction:rehab_secret@db:5432/refunction_rehab

# Auth
JWT_SECRET=change_this_to_a_long_random_secret

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Email
SMTP_HOST=
SMTP_USER=
SMTP_PASS=

# Cloudinary
CLOUDINARY_URL=
```

**One-command startup (local dev)**:
```bash
cp .env.example .env        # fill in secrets
docker compose up --build   # pulls postgres:16-alpine, builds server + client, runs migrations
```

**Prisma workflow inside Docker**:
- `npx prisma migrate deploy` runs automatically on server container start (via CMD in Dockerfile)
- To run migrations manually during dev: `docker compose exec server npx prisma migrate dev`
- To open Prisma Studio: `docker compose exec server npx prisma studio`

### Cloud Deployment

The same `docker-compose.yml` works on any cloud VM (AWS EC2, GCP Compute Engine, DigitalOcean Droplet, etc.) without modification:

```bash
# On any cloud VM with Docker installed:
git clone <repo>
cd refunction-rehab
cp .env.example .env   # set production secrets
docker compose up -d   # runs in background, postgres data persists in named volume
```

**Managed cloud DB option** (recommended for production):
For platforms like Railway, Render, AWS RDS, Supabase, or Neon — simply override `DATABASE_URL` in the environment and remove the `db` service from `docker-compose.yml`. The server and client containers remain identical.

```env
# Example: Using Supabase / Neon / Railway Postgres
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
```

Prisma handles both local Docker Postgres and managed cloud Postgres identically — no code changes required.

### Data Persistence Rules (CRITICAL)
- Every patient enrollment form submission MUST be saved to the `Patient` table via `POST /api/patients/enroll`.
- Every payment recorded MUST be saved to the `Payment` table via `POST /api/payments`.
- Every contact form submission MUST be saved to the `ContactInquiry` table via `POST /api/contact`.
- PostgreSQL data persists across container restarts via the `postgres_data` named Docker volume.
- The frontend must call real API endpoints — **no `console.log` placeholders** in production code.
- On enrollment success, return the generated Patient ID to the frontend and display it to the user.
- **Enrollment and payment are independent operations.** Enrollment creates a `Patient` record without requiring any payment. Payments are linked to patients via `patientId` but are created as separate records at any time after enrollment. A patient may have zero, one, or many associated payments.
- **Pending payment tracking must include enrolled-but-unpaid patients.** A patient who has enrolled but has zero `Payment` records is considered to have a pending payment. The dashboard's "Pending Payments" count and the admin patients table must account for these patients — not only patients with a `Payment` record in `partial` or `pending` status.

---

## 3. Site Architecture

```
/                          → Home (Hero + Services overview)
/services                  → All services listing
/services/seniors          → Physiotherapy for Seniors
/services/womens-health    → Women's Health (postnatal, pelvic floor)
/services/pain-management  → Neck, Back & Shoulder Pain
/services/sports-rehab     → Sports Injury & Post-Surgery
/services/kids             → Kids Exercise & Development
/about                     → About Dr. Neha + Clinic
/enroll                    → Patient Enrollment Form (saves to DB)
/book                      → Book an Appointment (redirect to enrollment or inline)
/payment                   → Payment Collection Page (saves to DB)
/contact                   → Contact + Location (saves to DB)
/admin                     → Doctor/Admin Dashboard (protected, JWT auth)
/admin/patients            → Full paginated patient list with search & filters
/admin/payments            → Full paginated payment records with revenue summary
/admin/dashboard           → Overview: total enrolled, today's sessions, revenue stats
```

---

## 4. Page-by-Page Specifications

### 4.1 Homepage (`/`)

**Hero Section**
- Full-width, navy-to-teal gradient background
- Headline: "Specialized Physiotherapy Care in [City]"
- Sub-headline: "Better Movement. Better Health. Better Life."
- Two CTAs: `[Book Appointment]` (orange) and `[Learn More]` (outlined white)
- Animated entrance (Framer Motion: staggered fade-up)

**Services Strip** — 6 cards in a horizontal scroll / grid:
1. 🧓 Physiotherapy for Seniors
2. 👩 Women's Health & Postnatal
3. 💪 Back, Neck & Shoulder Pain
4. ⚽ Sports Injury Rehab
5. 🧒 Kids Exercise Program
6. 🦴 Post-Surgery Rehabilitation

**Why Choose Us** — 4 icon stats in a teal band:
- 15+ Years Experience
- Safe • Supervised • Personalized • Effective
- Dedicated Space & Advanced Equipment
- Patient Privacy • Billing Available

**Conditions We Treat** (from Image 4):
Back Pain & Neck Pain, Postural Correction, SI Joint Pain, Fracture Rehabilitation, Sports Injuries, Orthopedic Conditions, Neurological Conditions, Arthritis, Osteoporosis

**Senior Care Feature Block** (from Image 1):
- Headline: "Physiotherapy for Seniors"
- Sub: "Specialized Care for Pain Relief, Mobility & Better Independence"
- We Help Manage: Neck & Joint Pain, Shoulder Pain, Arthritis, Osteoporosis & Low Bone Density
- Exercise journey: Neck Stretch → Shoulder Mobility → Knee Strengthening → Balance Training

**Women's Health Feature Block** (from Image 2 & 5):
- Headline: "Post-Pregnancy Belly Not Reducing?"
- Wrong vs Right approach (crunches vs breathing + core activation)
- Target: Diastasis Recti, Back Pain, Pelvic Floor Weakness, Postnatal Recovery
- 7PM–8PM Batch — Few Spots Available

**Pain Management Feature Block** (from Image 3):
- Headline: "Still Struggling with Back Pain, Neck Pain, or Shoulder Pain?"
- Specialized Assessment & Supervised Exercise
- Results: Treated Chronic Neck Pain, Back Pain, Knee Replacements (TKRs) • Improved Movement & Flexibility • Reduced Pain, Better Quality of Life

**CTA Banner**:
> "Take the First Step Towards a Pain-Free & Active Life!"
> Our experts are here to guide you at every step of your recovery and fitness journey.
> `[Call Us Today: 99009 11795]` `[Book Appointment →]`

**Footer**:
- Logo + tagline
- Quick links (all pages)
- Contact: phone, WhatsApp button
- Social media icons (Instagram, Facebook, YouTube — placeholders)
- © 2025 ReFunction Rehab. All rights reserved.

---

### 4.2 Patient Enrollment Form (`/enroll`)

Custom multi-step React form (Google Form removed). Goes directly to the registration form — no mode selection screen.

**Section 1 — Personal Information**
- Full Name*, Age*, Gender*
- Date of Birth (optional), Nationality (optional), Occupation (optional)
- Blood Group (A+/A-/B+/B-/AB+/AB-/O+/O-)
- Enrollment Date (optional, defaults to today — allows backdating for paper registrations)

**Section 2 — Contact Information**
- Mobile Number*, Alternate Mobile
- Email Address, Pin Code
- Home Address (optional), City (optional), State (optional)

**Section 3 — Emergency Contact** (all optional)
- Emergency Contact Name, Number, Relationship

**Section 4 — Program Selection**
- Type of Program* (checkboxes: Physiotherapy, General Health & Fitness, Kids Exercise, Post-Surgery Rehab, Sports Injury, Elderly Care, Other)
- Session Type*: In-Person / Online / Home Visit
- Preferred Days* (Mon–Sun checkboxes)
- Preferred Time*: Morning 6–9AM / Mid-Morning 9–12 / Afternoon 12–3 / Evening 3–6 / Late Evening 6–9PM

**Section 5 — Medical History**
- Existing conditions? (Yes/No + specify)
- Past surgeries? (Yes/No + details)
- Current medications? (Yes/No + list)
- Known allergies? (Yes/No + specify)
- Conditions checklist: Diabetes, Hypertension, Heart Disease, Arthritis, Osteoporosis, Asthma, Neurological Disorder, None

**Section 6 — Physiotherapy Details**
- Area of pain: Neck, Shoulder, Back, Hip, Knee, Ankle, Wrist, Elbow, Other
- Duration: <1 week / 1–4 weeks / 1–3 months / 3–6 months / >6 months
- Pain Severity: Slider 1–10
- Previous physiotherapy? (Yes/No + describe)
- Doctor's referral? (Yes/No)

**Section 7 — Kids Program** (shown conditionally)
- Child's Name, Age, Grade
- Parent/Guardian Name*, Contact*
- Special needs, dietary restrictions, prior sports activity

**Section 8 — Goals & Discovery**
- Health goals: Pain Relief, Improved Mobility, Weight Management, Strength Building, Post-Surgery Recovery, Stress Relief, General Fitness, Kids Physical Development, Other
- Fitness Level: Beginner / Intermediate / Advanced
- How did you hear about us: Social Media / Friend/Family / Doctor Referral / Online Search / Advertisement / Other

**Section 9 — Insurance & Payment**
- Health insurance? (Yes/No + provider + policy number)
- Preferred payment: Cash / Credit/Debit Card / UPI / Net Banking / Insurance Claim

**Section 10 — Consent**
- 4 checkboxes with declaration text (all mandatory to submit)
- Patient/Guardian Signature (canvas-based e-signature component)
- Submit button → POST to `/api/patients/enroll`

On success: show confirmation card + option to "Proceed to Payment"

> **Enroll Now, Pay Later**: Payment is **not** mandatory at enrollment time. Patients receive their Patient ID immediately upon successful enrollment. Payment can be made at any later time via the `/payment` page by searching with Patient ID or mobile number. Staff can also record payments later from the admin dashboard (`/admin/payments`). The "Proceed to Payment" link on the success screen is a convenience shortcut — not a required step.

---

### 4.3 Payment Collection Page (`/payment`)

> **Independent of Enrollment**: The payment page operates independently and is accessible at any time — not only immediately after enrollment. Staff can open `/payment` directly, look up any existing patient by Patient ID or mobile number, and record a payment. This makes deferred "pay later" workflows seamless. Multiple payments over time for the same patient are fully supported (session-wise billing), since the `Patient → Payment` relationship is one-to-many.

Based on the Patient Payment Collection Form PDF:

**Section 1 — Patient Lookup**
- Search by Patient ID or Mobile Number
- Auto-fill: Patient Name, Doctor/Therapist Name, Session Number, Department

**Section 2 — Service Details**
- Session Visit Number, Session Date, Duration
- Service type checkboxes: Initial Consultation, Follow-up, Physiotherapy Session, Exercise Training, Kids Exercise, Post-Surgery Rehab, Sports Injury, Elderly Care, Home Visit, Group Session, Online Session, Other
- Fee Breakdown table: Service Description | Qty | Unit Rate (₹) | Discount (₹) | Amount (₹)
- Sub Total, GST (if applicable), **TOTAL AMOUNT PAYABLE** (large, bold)

**Section 3 — Payment Mode**
Dynamic form sections (show/hide based on selection):

- **Cash**: Amount Received, Change, Received By
- **UPI** (Razorpay QR or manual): Transaction ID, App (GPay/PhonePe/Paytm/Other), UPI ID, Date & Time
- **Net Banking**: Bank Name, Transaction/Reference ID, Account Holder, Date & Time
- **Credit/Debit Card** (Razorpay): Card Type, Last 4 Digits, Bank, Approval Code
- **Cheque**: Cheque Number, Bank Name, Date, Drawn in Favour Of
- **Insurance/EMI**: Provider, Policy/Claim Number, Pre-Auth Code, EMI Plan/Tenure

**Section 4 — Payment Summary**
- Total Charged, Amount Paid, Balance Due, Advance Paid
- Status: Paid in Full / Partial / Pending / Advance / Refund / Waived Off
- Remarks / Notes

**Section 5 — Authorization**
- Collected By (Staff Name), Staff Signature (e-sign), Staff ID
- Patient/Guardian Signature (e-sign)
- Authorised By (Doctor/Manager)

**Actions**:
- `[Generate Receipt]` → PDF receipt download (matching the payment receipt format from PDF)
- `[Send to Patient]` → Email/WhatsApp the receipt
- `[Save Record]` → POST to `/api/payments`

**Receipt Format** (auto-generated PDF):
```
REFUNCTION REHAB — PAYMENT RECEIPT
Receipt No. | Date | Patient Name | Patient ID
Doctor/Therapist | Session No. | Amount Paid ₹___
Payment Mode | Transaction ID
Services Rendered table
Patient Signature | Staff Signature | Stamp
"Thank you for your payment! Wishing you a speedy recovery."
```

---

### 4.4 Contact Page (`/contact`)

- Clinic address (to be filled — placeholder: Bengaluru, Karnataka)
- Phone: 99009 11795 (click-to-call)
- WhatsApp: 99009 11795 (wa.me link)
- Embedded Google Map iframe
- Quick contact form: Name, Phone, Message → POST to `/api/contact`
- Business hours (placeholder: Mon–Sat 6AM–9PM)
- Batch timing prominently: **7PM–8PM Batch** — Few Spots Available

---

## 5. Backend API Routes

All routes that write data MUST persist to PostgreSQL via Prisma. No in-memory or mock storage.

```
# Patient Enrollment
POST   /api/patients/enroll         → Save to Patient table, return { patientId, message }, send confirmation email
GET    /api/patients/:id            → Get patient by ID (with payment history)
GET    /api/patients/search?q=      → Search by name / phone / patient ID
PATCH  /api/patients/:id            → Update patient details (implemented, requires auth)

# Payments
POST   /api/payments                → Save to Payment table, return { paymentId, receiptNo }
GET    /api/payments/:id            → Get payment record by ID
GET    /api/payments/receipt/:id    → Generate and return PDF receipt
GET    /api/payments/patient/:id    → All payments for a specific patient

# Contact Inquiries
POST   /api/contact                 → Save to ContactInquiry table, notify admin via email

# Auth
POST   /api/auth/login              → Validate staff credentials → return JWT token
POST   /api/auth/logout             → Invalidate session

# Doctor / Admin Dashboard (all protected — require valid JWT)
GET    /api/admin/dashboard         → {
                                        totalPatients,
                                        newPatientsToday,
                                        newPatientsThisMonth,
                                        totalRevenue,
                                        revenueToday,
                                        revenueThisMonth,
                                        pendingPayments,
                                        recentEnrollments[],
                                        recentPayments[],
                                        paymentModeBreakdown{}
                                      }
GET    /api/admin/patients          → Paginated patient list (page, limit, search, program filter, date range)
GET    /api/admin/payments          → Paginated payment records (page, limit, status filter, date range)
GET    /api/admin/patients/export   → CSV export of all patients
GET    /api/admin/payments/export   → CSV export of all payments
```

---

## 6. Database Schema (Prisma)

```prisma
model Patient {
  id                String    @id              // Sequential RF-XXXX format (e.g. RF-0001, RF-0002) generated via patient_serial_seq
  fullName          String
  dob               DateTime?
  age               Int
  gender            String
  bloodGroup        String?
  mobile            String    @unique
  alternateMobile   String?
  email             String?
  address           String?
  city              String?
  state             String?
  pinCode           String?
  emergencyName     String?
  emergencyPhone    String?
  emergencyRelation String?
  program           String[]
  sessionType       String
  preferredDays     String[]
  preferredTime     String
  medicalConditions String?
  pastSurgeries     String?
  medications       String?
  allergies         String?
  conditions        String[]
  painAreas         String[]
  painDuration      String?
  painSeverity      Int?
  fitnessGoals      String[]
  fitnessLevel      String?
  referralSource    String?
  insuranceProvider String?
  insurancePolicy   String?
  paymentPreference String?
  consentGiven      Boolean   @default(false)
  signature         String?   // base64 or URL
  enrolledAt        DateTime  @default(now())
  payments          Payment[]
}

model Payment {
  id               String   @id @default(cuid())
  receiptNo        String   @unique @default(cuid())
  patientId        String
  patient          Patient  @relation(fields: [patientId], references: [id])
  sessionNo        Int?
  sessionDate      DateTime
  sessionDuration  String?
  services         Json     // array of {description, qty, unitRate, discount, amount}
  subTotal         Float
  gst              Float    @default(0)
  totalAmount      Float
  amountPaid       Float
  balanceDue       Float    @default(0)
  advancePaid      Float    @default(0)
  paymentMode      String   // cash/upi/netbanking/card/cheque/insurance/emi
  transactionId    String?
  paymentDetails   Json?    // mode-specific details
  status           String   // paid/partial/pending/advance/refund/waived
  remarks          String?
  collectedBy      String
  staffSignature   String?
  patientSignature String?
  authorisedBy     String?
  createdAt        DateTime @default(now())
}

model ContactInquiry {
  id        String   @id @default(cuid())
  name      String
  phone     String
  message   String
  createdAt DateTime @default(now())
  resolved  Boolean  @default(false)
}
```

---

## 7. UI Component Library (Key Custom Components)

| Component | Purpose |
|---|---|
| `<ServiceCard />` | Icon + title + short desc + CTA |
| `<ConditionBadge />` | Pill badge for conditions treated |
| `<StatStrip />` | "15+ Years • Supervised • Personalized" teal banner |
| `<ExerciseJourney />` | Step-by-step exercise flow (Neck→Shoulder→Knee→Balance) |
| `<WrongRight />` | Side-by-side Wrong ❌ vs Right ✅ comparison |
| `<PaymentModeForm />` | Dynamic form switching by payment mode |
| `<ESignaturePad />` | Canvas-based e-signature (react-signature-canvas) |
| `<FeeTable />` | Editable fee breakdown table |
| `<ReceiptPDF />` | react-pdf based receipt generator |
| `<CTABanner />` | Full-width navy CTA with phone number |
| `<BatchBadge />` | "7PM–8PM Batch • Few Spots Available" urgency badge |
| `<WhatsAppButton />` | Floating WhatsApp CTA (bottom-right, always visible) |

---

## 8. Design Rules

1. **Navy + Teal + Orange** are the three core colors — every page must use all three meaningfully.
2. All CTA buttons: orange `#E8630A` with white text, rounded-full, hover scale-105.
3. Section alternation: white bg → light blue `#F0F6FA` → navy → repeat.
4. Cards: white, rounded-2xl, subtle shadow, hover lift (translateY -4px).
5. All icons from **Lucide React** — never use emoji as UI icons.
6. Mobile-first responsive — clinic patients may be elderly; font-size minimum 16px body, 14px labels.
7. Floating WhatsApp button always visible on mobile and desktop.
8. Form validation errors: red border + inline message below field.
9. Page transitions: Framer Motion `AnimatePresence` fade.
10. Loading states: skeleton loaders (not spinners) for data-fetching sections.

---

## 9. Services Content

### Physiotherapy for Seniors
- **Tagline**: Better Movement. Better Health. Better Life.
- **Focus**: Pain relief, mobility, independence
- **Manages**: Neck & Joint Pain, Shoulder Pain, Arthritis, Osteoporosis & Low Bone Density
- **Program**: Supervised Exercise — Neck Stretch, Shoulder Mobility, Knee Strengthening, Balance Training
- **Promise**: Safe, supervised, personalized, effective. Medical conditions monitored regularly.

### Women's Health & Postnatal
- **Tagline**: Heal. Strengthen. Feel confident in your body again.
- **Target**: Postpartum moms, women with Diastasis Recti, Pelvic Floor Weakness, Back Pain
- **Approach**: Starts with core & pelvic floor assessment → Breathing + Core Activation → Safe Progression
- **NOT**: Random crunches or generic workouts
- **Batch**: 7PM–8PM | Limited spots
- **Credential**: Dr. Neha Trivedi — MPT, trained in prenatal and postnatal Pilates

### Back, Neck & Shoulder Pain
- **Tagline**: Stop Just Relieving the Pain — Treat the Cause
- **Problem**: Regular exercises not helping? You need a specialized program designed for YOU
- **Solution**: Specialized Assessment + Supervised Exercise
- **Results**: Treated Chronic Neck Pain, Back Pain, Knee Replacements (TKRs); Improved Movement & Flexibility; Reduced Pain

### Sports Injury & Post-Surgery Rehab
- **Conditions**: Sports Injuries, Fracture Rehabilitation, Post-Surgery Recovery, SI Joint Pain
- **Approach**: Evidence-based progressive rehab, sport-specific return-to-play protocols

### Kids Exercise & Development
- **Focus**: Physical development, posture, coordination
- **Features**: Age-appropriate programs, supervised sessions, fun-based approach

---

## 10. Key Implementation Notes

- **Enrollment**: The `/enroll` page uses a custom multi-step React form (4 steps: Personal, Contact, Program, Goals). All data is stored directly in the PostgreSQL database. Google Form integration has been removed.

- **Payment**: Integrate Razorpay for online payments. For cash/cheque, staff records manually via admin dashboard.

- **Receipt PDF**: Use `@react-pdf/renderer` to generate receipts server-side matching the official format from the PDF.

- **WhatsApp CTA**: All "Contact" buttons should open `https://wa.me/919900911795` with a pre-filled message: "Hi Dr. Neha, I'd like to book a physiotherapy session."

- **Admin / Doctor Dashboard** (protected, `/admin`): Accessible only after staff/doctor login with JWT. Must show real data fetched from the database:
  - **Overview cards**: Total patients enrolled, new today, new this month, total revenue, revenue today, pending payments count.
  - **Patient table** (`/admin/patients`): Full list with name, phone, program, enrollment date, status. Searchable, filterable by program and date. Exportable to CSV.
  - **Payment table** (`/admin/payments`): All payment records with patient name, amount, mode, status, date. Filterable by status and date range. Revenue totals shown. Exportable to CSV.
  - **Recent activity feed**: Last 10 enrollments and last 10 payments on the dashboard home.
  - **Payment mode breakdown**: Pie/bar chart showing Cash vs UPI vs Card vs Cheque split.

- **Environment variables needed**:
  ```
  DATABASE_URL=
  RAZORPAY_KEY_ID=
  RAZORPAY_KEY_SECRET=
  JWT_SECRET=
  SMTP_HOST=
  SMTP_USER=
  SMTP_PASS=
  CLOUDINARY_URL=
  ```

---

## 11. Folder Structure

```
refunction-rehab/
├── docker-compose.yml       # Starts postgres (Docker Hub) + server + client
├── .env.example             # Template — copy to .env and fill secrets
├── .env                     # Actual secrets — never commit to git
├── .gitignore               # Must include .env and node_modules
│
├── client/                  # React + Vite frontend
│   ├── Dockerfile           # Multi-stage: build → nginx:alpine
│   ├── nginx.conf           # SPA routing + /api proxy to server
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/      # Navbar, Footer, FloatingWhatsApp
│   │   │   ├── home/        # Hero, ServiceCards, FeatureBlocks, CTABanner
│   │   │   ├── forms/       # EnrollmentForm, PaymentForm, ContactForm
│   │   │   ├── ui/          # Buttons, Cards, Badges, Modals
│   │   │   └── receipt/     # ReceiptPDF, ESignaturePad
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Services.jsx
│   │   │   ├── ServiceDetail.jsx
│   │   │   ├── Enroll.jsx
│   │   │   ├── Payment.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── About.jsx
│   │   │   └── admin/
│   │   │       ├── Login.jsx
│   │   │       ├── Dashboard.jsx
│   │   │       ├── Patients.jsx
│   │   │       └── Payments.jsx
│   │   ├── hooks/           # usePatient, usePayment, useAuth
│   │   └── lib/             # api.js (axios instance), validators.js
│
├── server/                  # Node + Express backend
│   ├── Dockerfile           # node:20-alpine, runs prisma migrate deploy on start
│   ├── index.js             # Express app entry point
│   ├── routes/
│   │   ├── patients.js
│   │   ├── payments.js
│   │   ├── contact.js
│   │   ├── auth.js
│   │   └── admin.js
│   ├── controllers/
│   ├── middleware/
│   │   └── auth.js          # JWT verification middleware
│   ├── prisma/
│   │   ├── schema.prisma    # Single source of truth for DB schema
│   │   └── migrations/      # Auto-generated by prisma migrate dev
│   └── utils/
│       ├── email.js
│       ├── pdf.js
│       └── receipt.js
│
└── README.md                # Must include: docker compose up --build as the single run command
```

---

## 12. Quick-Start Build Order

When building this app from scratch, follow this order:

1. **Docker setup**: Write `docker-compose.yml`, `server/Dockerfile`, `client/Dockerfile`, `nginx.conf`, `.env.example`
2. **Verify DB**: `docker compose up db` — confirm postgres:16-alpine pulls and starts cleanly
3. **Backend scaffold**: Express server + Prisma schema + `prisma migrate dev` inside container
4. **All API routes**: patients, payments, contact, auth, admin — all wired to Prisma/PostgreSQL
5. **Frontend setup**: Vite + React + Tailwind + Framer Motion + React Router
6. **Layout**: Navbar (with logo) + Footer + FloatingWhatsApp
7. **Homepage**: Hero → Services strip → Feature blocks → CTA banner
8. **Services pages**: One template, render per service
9. **Enrollment form**: Multi-step form → POST to `/api/patients/enroll` → save to DB
10. **Payment page**: Dynamic payment mode forms + fee table → POST to `/api/payments` → save to DB
11. **Wire all forms to API**: No `console.log` — every submission hits the real endpoint
12. **Admin/Doctor Dashboard**: Login → JWT auth → patient table, payment table, revenue stats from DB
13. **Razorpay**: Online payment integration
14. **PDF receipt**: react-pdf receipt generator
15. **Export**: CSV download for patients and payments
16. **Full Docker test**: `docker compose up --build` — entire stack runs from one command, no local DB needed
17. **Polish**: Animations, mobile responsiveness, loading states, skeleton loaders

## 13. Doctor Dashboard — Page Specifications (`/admin`)

### 13.1 Login (`/admin/login`)
- Email + Password form → POST `/api/auth/login` → store JWT in localStorage
- Redirect to `/admin/dashboard` on success
- All `/admin/*` routes are protected — redirect to `/admin/login` if no valid JWT

### 13.2 Dashboard Home (`/admin/dashboard`)
**Stat Cards Row:**
- Total Patients Enrolled (all time)
- New Patients Today
- New Patients This Month
- Total Revenue (all time, ₹)
- Revenue Today (₹)
- Pending Payments (count + ₹ value) — **must include** patients who enrolled but have zero payment records (not just payments with `partial`/`pending` status). Count = patients with no payments + payment records in `partial`/`pending` status.

**Recent Enrollments Table** (last 10):
- Patient Name | Program | Session Type | Enrolled At | Actions (View)

**Recent Payments Table** (last 10):
- Patient Name | Amount (₹) | Mode | Status | Date | Actions (Receipt)

**Payment Mode Breakdown Chart:**
- Bar or donut chart — Cash / UPI / Card / Net Banking / Cheque counts and totals

### 13.3 Patients Page (`/admin/patients`)
- Search bar (name / phone / patient ID)
- Filter: Program type, Enrollment date range
- Paginated table: ID | Name | Age | Gender | Mobile | Program | Session Type | Enrolled At | Payment Status | Actions
- **Payment Status column**: Show a badge per patient — green "X paid" if they have payment records, amber "No payment" if they have zero payment records. This gives staff immediate visibility into who has enrolled but not yet paid.
- Actions: **Edit** (links to `/admin/patients/:id/edit` — implemented), View full profile, Download enrollment card, **Record Payment** (links to `/payment?patientId={id}` for quick deferred payment recording)
- **Export to CSV** button (calls `GET /api/admin/patients/export`)
- Total count shown: "Showing X of Y patients"

### 13.4 Payments Page (`/admin/payments`)
- Filter: Payment status (Paid / Partial / Pending / Refund), Date range, Payment mode
- Paginated table: Receipt No. | Patient | Services | Amount (₹) | Mode | Status | Date | Actions
- Actions: View receipt, Download PDF receipt
- **Revenue Summary bar** at top: Total Collected | Pending | Refunded
- **Export to CSV** button (calls `GET /api/admin/payments/export`)

---

## 14. Visual Content & Imagery

The portal must include relevant photographs and images to make it more appealing, relatable, and trustworthy for patients. Visual content helps patients understand treatments, feel comfortable with the clinic environment, and connect emotionally with the care they will receive.

### Why Images Matter
- **Patients relate better** to real exercise and treatment visuals than text-only descriptions
- **Builds trust** — seeing the clinic, equipment, and doctor in action reduces anxiety for new patients
- **Increases engagement** — pages with images have significantly higher time-on-page and conversion rates
- **Demonstrates expertise** — showing supervised exercises and proper form highlights the clinic's professional approach

### Where to Add Images

| Location | Image Type | Purpose |
|---|---|---|
| **Homepage Hero** | Dr. Neha with patient / clinic interior | First impression, builds trust |
| **Services Cards** | Exercise/treatment photos per service | Helps patients identify their need |
| **Senior Care Section** | Elderly patients doing guided exercises | Relatable for senior patients and their families |
| **Women's Health Section** | Postnatal recovery / Pilates exercises | Appeals to target demographic |
| **Pain Management Section** | Neck/back/shoulder therapy in action | Shows specialized treatment approach |
| **Sports Rehab Section** | Sports injury rehabilitation exercises | Attracts active/sports patients |
| **Kids Exercise Section** | Children in fun exercise activities | Appeals to parents |
| **About Page** | Dr. Neha Trivedi professional photo, clinic facility, equipment | Credibility and familiarity |
| **Service Detail Pages** | Step-by-step exercise demonstrations | Educates and engages patients |
| **Enrollment Success** | Welcoming/motivational image | Positive reinforcement |
| **Contact Page** | Clinic exterior / reception area | Helps patients locate and recognize the clinic |

### Image Guidelines
- **Prefer real clinic photos** over stock images whenever possible — authenticity builds trust
- All images should be **optimized for web** (WebP format, compressed, lazy-loaded)
- Use **alt text** for accessibility (e.g., "Senior patient performing guided knee strengthening exercise")
- Maintain **consistent aspect ratios** per section (16:9 for hero banners, 4:3 or 1:1 for cards)
- Images should reflect the **diverse patient base** — seniors, women, kids, athletes
- Store images in `/client/public/images/` or use Cloudinary for CDN delivery
- Every service page should have at least **2–3 relevant images** showing exercises or treatment in progress

### Suggested Image Categories
1. **Exercise Demonstrations** — Neck stretches, shoulder mobility, knee strengthening, balance training, core activation, Pilates
2. **Treatment in Action** — Physiotherapy sessions, supervised exercise, assessment procedures
3. **Facility & Equipment** — Clinic interior, treatment rooms, exercise area, equipment
4. **Doctor & Staff** — Professional headshots, candid treatment photos
5. **Patient Journey** — Welcome/reception, consultation, exercise session, recovery milestones
6. **Results & Testimonials** — Before/after posture improvements, patient success stories (with consent)
