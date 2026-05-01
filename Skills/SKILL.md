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
/services/sports-rehab     → Sports Injury Rehab
/services/post-surgery     → Post-Surgery Rehab
/services/kids             → Kids Exercise & Development
/about                     → About Dr. Neha + Clinic
/enroll                    → Patient Enrollment Form (saves to DB)
/book                      → Book an Appointment (redirect to enrollment or inline)
/payment                   → Payment Collection Page (saves to DB)
/contact                   → Contact + Location (saves to DB)
/testimonials              → All patient testimonials (public)
/admin                     → Doctor/Admin Dashboard (protected, JWT auth)
/admin/patients            → Full paginated patient list with search & filters
/admin/payments            → Full paginated payment records with revenue summary
/admin/dashboard           → Overview: total enrolled, today's sessions, revenue stats
/admin/testimonials        → Manage testimonials (add, edit, approve, delete)
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
6. 🦴 Post-Surgery Rehab

**Why Choose Us** — 4 icon stats in a teal band:
- 15+ Years Experience
- Safe • Supervised • Personalized • Effective
- Dedicated Space & Advanced Equipment
- Patient Privacy • Billing Available

**Conditions We Treat** (from Image 4):
Back Pain & Neck Pain, Postural Correction, SI Joint Pain, Fracture Rehabilitation, Sports Injuries, Orthopedic Conditions, Neurological Conditions, Arthritis, Osteoporosis

**Feature Blocks Layout** — Two-column grid (`lg:grid-cols-2`) with `items-start`. The text column uses `lg:sticky lg:top-24` so it stays visible as users scroll past the tall portrait images. Info cards (Exercise Journey, Treats, Results) are placed in the text column alongside the heading and description to fill the space.

**Senior Care Feature Block** (from Image 1):
- Headline: "Physiotherapy for Seniors"
- Sub: "Specialized Care for Pain Relief, Mobility & Better Independence"
- We Help Manage: Neck & Joint Pain, Shoulder Pain, Arthritis, Osteoporosis & Low Bone Density
- Exercise Journey card (navy bg): Neck Stretch → Shoulder Mobility → Knee Strengthening → Balance Training
- Image on left, text + journey card on right (sticky)

**Women's Health Feature Block** (from Image 2 & 5):
- Headline: "Post-Pregnancy Belly Not Reducing?"
- Wrong vs Right approach (crunches vs breathing + core activation)
- Treats card (gradient bg): Diastasis Recti, Back Pain, Pelvic Floor Weakness, Postnatal Recovery, Prenatal Fitness
- 7PM–8PM Batch — Few Spots Available
- Text + treats card on left (sticky), image on right

**Pain Management Feature Block** (from Image 3):
- Headline: "Still Struggling with Back Pain, Neck Pain, or Shoulder Pain?"
- Specialized Assessment & Supervised Exercise
- Results We Deliver card: Chronic Neck Pain, Chronic Back Pain, Knee Replacements (TKR), Improved Flexibility, Better Quality of Life
- Image on left, text + results card on right (sticky)

**Patient Testimonials Section** (between Feature Blocks and CTA Banner):
- Heading: "What Our Patients Say"
- Auto-scrolling carousel of 3–4 featured testimonials
- Each card: star rating, quote, patient name/initials, condition, outcome
- "View All Testimonials →" link to `/testimonials`
- Data: `GET /api/testimonials?featured=true`

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
- Default rate: ₹600 per session
- Sub Total, GST (if applicable), Package Discount (if applicable, shown in green), **TOTAL AMOUNT PAYABLE** (large, bold)

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
                                      Optional package fields: isPackage, packageName, totalSessions, expiryDate, packageNotes
                                      When isPackage=true, atomically creates Payment + TreatmentPackage via $transaction()
GET    /api/payments/:id            → Get payment record by ID
GET    /api/payments/receipt/:id    → Generate and return PDF receipt
GET    /api/payments/patient/:id    → All payments for a specific patient

# Packages & Visits (all protected — require valid JWT)
GET    /api/admin/packages?patientId={id} → List all packages for a patient (with visit counts & visits)
GET    /api/admin/packages/:id            → Get package details with all visits, patient, and payment info
PATCH  /api/admin/packages/:id            → Update package (status, notes, expiryDate, packageName)
POST   /api/admin/packages/:id/visits     → Record a visit (auto-increments visitNumber, auto-completes on last session)
DELETE /api/admin/packages/:id/visits/:visitId → Remove a visit (re-numbers remaining, reverts completed→active)

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
                                        paymentModeBreakdown{},
                                        activePackages,
                                        visitsToday,
                                        attentionPackages[]
                                      }
GET    /api/admin/patients          → Paginated patient list (page, limit, search, program filter, date range)
GET    /api/admin/payments          → Paginated payment records (page, limit, status filter, date range)
GET    /api/admin/patients/export   → CSV export of all patients
GET    /api/admin/payments/export   → CSV export of all payments

# Testimonials
GET    /api/testimonials            → Get all approved testimonials (public, no auth)
GET    /api/testimonials/:id        → Get single testimonial by ID (public)
POST   /api/admin/testimonials      → Create new testimonial (protected)
PATCH  /api/admin/testimonials/:id  → Update testimonial (edit, approve/reject) (protected)
DELETE /api/admin/testimonials/:id  → Delete testimonial (protected)
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
  packages          TreatmentPackage[]
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
  package          TreatmentPackage?   // optional one-to-one: a payment may create a package
}

model ContactInquiry {
  id        String   @id @default(cuid())
  name      String
  phone     String
  message   String
  createdAt DateTime @default(now())
  resolved  Boolean  @default(false)
}

model Testimonial {
  id            String   @id @default(cuid())
  patientName   String                          // Display name (can be first name only for privacy)
  patientInitials String?                       // e.g. "R.K." — used if patient prefers anonymity
  age           Int?
  gender        String?
  condition     String                          // e.g. "Chronic Back Pain", "Post-Knee Replacement"
  service       String                          // Which service: seniors, womens-health, pain-management, sports-rehab, post-surgery, kids
  rating        Int      @default(5)            // 1–5 star rating
  reviewText    String                          // The testimonial content
  videoUrl      String?                         // Optional YouTube/video link
  photoUrl      String?                         // Optional patient photo (with consent)
  treatmentDuration String?                     // e.g. "3 months", "6 weeks"
  outcome       String?                         // Brief result: "Pain-free in 8 weeks", "Walking independently"
  isApproved    Boolean  @default(false)        // Only approved testimonials shown publicly
  isFeatured    Boolean  @default(false)        // Featured testimonials shown on homepage
  consentGiven  Boolean  @default(true)         // Patient consent for public display
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
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
| `<TestimonialCard />` | Patient testimonial card with rating stars, quote, condition, and outcome |
| `<TestimonialCarousel />` | Auto-scrolling carousel of featured testimonials for homepage |

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

### Physiotherapy for Seniors (`/services/seniors`)
- **Tagline**: Better Movement. Better Health. Better Life.
- **Image**: `images.seniors` (pic-1.jpeg)
- **Manages**: Neck & Joint Pain, Shoulder Pain, Arthritis, Osteoporosis & Low Bone Density
- **Journey**: Initial Assessment → Neck Stretches → Shoulder Mobility → Knee Strengthening → Balance Training
- **Highlights**: Gentle age-tailored exercises, continuous vitals monitoring, fall prevention programs, home exercise plans
- **Session Info**: 45–60 min, 3–5 sessions/week, In-clinic & Home visits

### Women's Health & Postnatal (`/services/womens-health`)
- **Tagline**: Heal. Strengthen. Feel confident in your body again.
- **Image**: `images.womensHealth` (pic-4.jpeg)
- **Target**: Diastasis Recti, Pelvic Floor Weakness, Back Pain During Pregnancy, Postnatal Recovery, Incontinence
- **Journey**: Core & Pelvic Assessment → Breathing Techniques → Core Activation → Progressive Loading → Full Functional Training
- **Highlights**: Certified prenatal & postnatal Pilates, safe trimester-specific exercises, pelvic floor recovery, small group batches
- **Session Info**: 60 min, 3 sessions/week, In-clinic (7PM–8PM batch)
- **Batch**: 7PM–8PM | Limited spots

### Back, Neck & Shoulder Pain (`/services/pain-management`)
- **Tagline**: Stop Just Relieving the Pain — Treat the Cause.
- **Image**: `images.painManagement` (pic-2.jpeg)
- **Conditions**: Chronic Back Pain, Cervical Spondylosis, Shoulder Impingement, SI Joint Pain, Disc Herniation, Postural Dysfunction
- **Journey**: Specialized Assessment → Pain Education → Manual Therapy → Exercise Prescription → Functional Return
- **Highlights**: Root-cause analysis, hands-on manual therapy + exercise, posture correction and ergonomic guidance, long-term prevention strategies
- **Session Info**: 45–60 min, 3–5 sessions/week, In-clinic

### Sports Injury Rehab (`/services/sports-rehab`)
- **Tagline**: Back to the Game, Stronger Than Before.
- **Image**: `images.clinic` (pic-3.jpeg)
- **Conditions**: ACL Reconstruction, Knee Replacement (TKR), Fracture Rehabilitation, Shoulder Surgery Recovery, Ankle Sprains, Muscle Tears
- **Approach**: Evidence-based progressive rehab, sport-specific return-to-play protocols
- **Journey**: Injury Assessment → Acute Phase → Strength & Stability → Functional Training → Return to Play/Activity
- **Highlights**: Surgeon-coordinated rehab protocols, sport-specific return-to-play programs, progressive loading with objective benchmarks, pre-surgery prehab
- **Session Info**: 45–60 min, 4–6 sessions/week, In-clinic

### Post-Surgery Rehab (`/services/post-surgery`)
- **Tagline**: Structured Recovery, Optimal Outcomes.
- **Image**: `images.postSurgery` (pic-8.jpeg)
- **Conditions**: Knee Replacement, Hip Replacement, Spinal Surgery, Rotator Cuff Repair, Fracture Fixation, Joint Replacements
- **Approach**: Comprehensive post-operative rehabilitation, surgeon-coordinated protocols
- **Journey**: Post-Op Assessment → Early Mobilization → Strengthening Phase → Functional Restoration → Full Recovery
- **Highlights**: Surgeon-coordinated protocols, phase-wise progression based on healing timelines, pain management and scar tissue mobilization, home exercise programs
- **Session Info**: 45–60 min, 4–6 sessions/week, In-clinic

### Kids Exercise Program (`/services/kids`)
- **Tagline**: Fun, Safe & Developmentally Appropriate.
- **Image**: `images.kids` (pic-7.jpeg)
- **Conditions**: Posture Correction, Flat Feet, Core Strengthening, Coordination & Balance, Sports Conditioning, Weight Management
- **Journey**: Child Assessment → Fun Movement Games → Core & Postural Work → Sport Skills → Progress Review
- **Highlights**: Fun game-based exercises, small groups (max 8–10 kids), supervised by qualified physiotherapists, regular progress reports for parents
- **Session Info**: 60 min, 3 sessions/week, In-clinic (SDA location)

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
│   │   │   ├── home/        # Hero, ServiceCards, FeatureBlocks, TestimonialCarousel, CTABanner
│   │   │   ├── testimonials/ # TestimonialCard, TestimonialCarousel
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
│   │   │   ├── Testimonials.jsx  # Public testimonials page
│   │   │   └── admin/
│   │   │       ├── Login.jsx
│   │   │       ├── Dashboard.jsx
│   │   │       ├── Patients.jsx
│   │   │       ├── Payments.jsx
│   │   │       └── Testimonials.jsx  # Admin testimonial management
│   │   ├── hooks/           # usePatient, usePayment, useAuth
│   │   └── lib/             # api.js (axios instance + package/visit API functions), validators.js
│
├── server/                  # Node + Express backend
│   ├── Dockerfile           # node:20-alpine, runs prisma migrate deploy on start
│   ├── index.js             # Express app entry point
│   ├── routes/
│   │   ├── patients.js
│   │   ├── payments.js
│   │   ├── packages.js       # Treatment package CRUD + visit recording
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
**Stat Cards Row** (4-column grid, 2 rows of 4):
- Total Patients Enrolled (all time)
- New Patients Today
- New Patients This Month
- Total Revenue (all time, ₹)
- Revenue Today (₹)
- Pending Payments (count + ₹ value) — **must include** patients who enrolled but have zero payment records (not just payments with `partial`/`pending` status). Count = patients with no payments + payment records in `partial`/`pending` status.
- Active Packages (count of packages with `status: "active"`)
- Visits Today (count of visits recorded today)

**Packages Needing Attention** (shown only when packages have ≤2 sessions remaining):
- Table: Patient Name | Package | Sessions Used | Remaining | Action (View link to patient profile)

**Recent Enrollments Table** (last 10):
- Patient Name | Program | Session Type | Enrolled At | Actions (View)

**Recent Payments Table** (last 10):
- Patient Name | Amount (₹) | Mode | Status | Date | Actions (Receipt)

**Payment Mode Breakdown Chart:**
- Bar or donut chart — Cash / UPI / Card / Net Banking / Cheque counts and totals

### 13.3 Patients Page (`/admin/patients`)
- Search bar (name / phone / patient ID)
- Filter: Program type, Enrollment date range
- Paginated table: ID | Name | Age | Gender | Mobile | Program | Session Type | Enrolled At | Payment Status | Pkg Status | Actions
- **Payment Status column**: Show a badge per patient — green "X paid" if they have payment records, amber "No payment" if they have zero payment records. This gives staff immediate visibility into who has enrolled but not yet paid.
- **Pkg Status column**: Shows the patient's active package progress — green "Active (4/10)" badge for active packages, or grey "No package" if none. **Clicking the badge opens the Packages & Visits modal** (see Section 16.7). Data comes from the `packages` field returned by the admin patients query (active packages only, with visit counts).
- Actions: **Edit** (links to `/admin/patients/:id/edit` — implemented), **Visits** (opens Packages & Visits modal — same as clicking the Pkg Status badge), **Payment** (links to `/payment?patientId={id}` for quick deferred payment recording)
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

The portal includes relevant photographs and images to make it more appealing, relatable, and trustworthy for patients.

### Current Image Mapping (`client/src/lib/images.js`)

| Key | File | Used For |
|---|---|---|
| `hero` | `/images/pic-6.png` | Homepage hero — Dr. Neha's photo |
| `seniors` | `/images/pic-1.jpeg` | Senior Care — home page & service detail |
| `painManagement` | `/images/pic-2.jpeg` | Pain Management — home page & service detail |
| `clinic` | `/images/pic-3.jpeg` | Sports Injury Rehab — service card & detail |
| `womensHealth` | `/images/pic-4.jpeg` | Women's Health — home page & service detail |
| `womensHealth2` | `/images/pic-5.jpeg` | Women's Health (alternate) |
| `kids` | `/images/pic-7.jpeg` | Kids Exercise — service card & detail |
| `postSurgery` | `/images/pic-8.jpeg` | Post-Surgery Rehab — service card & detail |

### Image Display Rules

All images are **portrait-oriented** (1024×1536px, 2:3 ratio). Display rules:

- **Home page feature blocks**: Rendered as plain `<motion.img>` at full width with natural height — no `object-cover` or forced aspect ratio. No cropping, no gaps.
- **Service cards** (Services.jsx): Fixed height `h-48` with `object-cover` — slight crop is acceptable for uniform grid thumbnails.
- **Service detail pages**: Rendered as plain `<motion.img>` at full width with natural height — same as home page.
- **Hero backgrounds**: Used at 20% opacity as a background overlay behind the gradient.

### Image Guidelines
- **Prefer real clinic photos** over stock images whenever possible — authenticity builds trust
- All images should be **optimized for web** (compressed, lazy-loaded)
- Use **alt text** for accessibility (e.g., "Senior patient performing guided knee strengthening exercise")
- Images are portrait (2:3) — never force them into landscape containers with `object-cover` as this crops important text overlays
- Store images in `/client/public/images/`
- Additional raw images available in `/client/img/` (pic-1 through pic-8)

### Service Detail Page Layout

Each service detail page has a **two-column layout** (`lg:grid-cols-2`, `items-start`):

**Left column**: Tagline, full-width image (natural height), description text, "What We Treat" checklist, CTA buttons.

**Right column** (3 stacked cards):
1. **Your Treatment Journey** — 5-step numbered journey with service-colored step badges
2. **Why Choose Us** — 4 service-specific highlights on a gradient background (navy → service color)
3. **Session Details** — Duration, frequency, mode + "Book via WhatsApp" button

---

## 15. Patient Testimonials Feature

Patient testimonials build trust and provide social proof. Since healthcare decisions are deeply personal, hearing from real patients who recovered from similar conditions significantly boosts enrollment confidence.

### 15.1 Homepage Testimonials Section

Placed between the Feature Blocks and CTA Banner on the homepage.

**Layout:**
- Section heading: "What Our Patients Say" with subtitle "Real stories from real patients"
- **Carousel/slider** of 3–4 featured testimonials (auto-scroll with pause on hover)
- Each card shows: star rating, quote excerpt (2–3 lines), patient name or initials, condition treated, outcome
- "View All Testimonials →" link to `/testimonials`
- Background: light (`bg-light`) to contrast with white feature blocks above

**Design:**
- Cards: white, rounded-2xl, shadow, with a large teal quote icon (`"`) at top-left
- Star rating: gold stars using Lucide `Star` icon
- Patient identity: Name or initials + age range + condition badge
- Outcome badge: green pill showing result (e.g., "Pain-free in 6 weeks")

### 15.2 Testimonials Page (`/testimonials`)

Dedicated page showing all approved testimonials.

**Layout:**
- Hero: gradient banner with heading "Patient Success Stories"
- Filter tabs: All | Seniors | Women's Health | Pain Management | Sports Injury | Post-Surgery | Kids
- Grid of testimonial cards (2 columns on desktop, 1 on mobile)
- Each card shows full review text, star rating, patient name/initials, condition, service, treatment duration, outcome
- Video testimonials: embedded YouTube player or play button overlay if `videoUrl` is present
- Pagination or "Load More" for large lists

**Data:** Fetched from `GET /api/testimonials` (only approved testimonials returned)

### 15.3 Admin Testimonials Management (`/admin/testimonials`)

Protected page for Dr. Neha / staff to manage testimonials.

**Features:**
- **Add Testimonial** button → modal/form with fields:
  - Patient Name*, Patient Initials (optional), Age, Gender
  - Condition Treated*, Service Category* (dropdown: seniors, womens-health, pain-management, sports-rehab, post-surgery, kids)
  - Rating* (1–5 star selector)
  - Review Text* (textarea)
  - Treatment Duration (e.g., "3 months")
  - Outcome (e.g., "Pain-free", "Walking independently")
  - Video URL (optional YouTube/Vimeo link)
  - Patient Photo URL (optional)
  - Consent checkbox (mandatory)
- **Table view** of all testimonials: Patient Name | Condition | Rating | Status (Approved/Pending) | Featured | Date | Actions
- **Actions per testimonial**: Edit, Approve/Reject toggle, Feature/Unfeature toggle, Delete
- **Bulk actions**: Approve selected, Delete selected
- Status badge: Green "Approved", Amber "Pending", Red "Rejected"

**Workflow:**
1. Dr. Neha or staff adds a testimonial after getting verbal/written consent from patient
2. Testimonial is created with `isApproved: false` by default
3. Staff reviews and toggles `isApproved: true` to make it public
4. Optionally marks as `isFeatured: true` to show on homepage carousel

### 15.4 Privacy & Consent Rules

- **Patient consent is mandatory** — the `consentGiven` field must be `true` before a testimonial can be approved
- Patients can choose to display their **full name, first name only, or just initials** — the `patientInitials` field provides anonymity
- **No medical records or identifiable health data** beyond what the patient consents to share
- Age is optional and displayed as a range (e.g., "60s") not exact age
- Photo is optional and only used with explicit consent
- Staff should **never fabricate testimonials** — all must come from real patients

### 15.5 Service Detail Page Integration

Each service detail page should show 1–2 relevant testimonials at the bottom (above the CTA banner), filtered by the service slug. This gives contextual social proof — a patient viewing "Physiotherapy for Seniors" sees testimonials from other seniors.

**Implementation:** Filter from `GET /api/testimonials?service={slug}&limit=2&featured=true`

---

## 16. Patient Visit Tracking & Package Management

Track the number of visits a patient has completed against their purchased treatment package. This helps Dr. Neha know exactly where each patient stands — how many sessions are done, how many remain, and when a renewal is due.

**Integration philosophy:** This feature is NOT a standalone system. It plugs into the existing Patient, Payment, and Dashboard modules — a package is born from a Payment, visits are tracked inside the existing patient profile page, and stats appear on the existing dashboard.

### 16.1 Why This Matters

- **For the doctor/clinic:** Quick visibility into each patient's attendance, avoids over- or under-servicing, and enables timely package renewal conversations.
- **For the patient:** Transparency on sessions used vs. remaining — no confusion or disputes.

### 16.2 Package & Visit Data Model

Add to the Prisma schema (Section 6). The `TreatmentPackage` links to both `Patient` and `Payment` — no duplicate amount/patient fields.

```prisma
model TreatmentPackage {
  id            String   @id @default(cuid())
  patientId     String
  patient       Patient  @relation(fields: [patientId], references: [id])
  paymentId     String
  payment       Payment  @relation(fields: [paymentId], references: [id])
  packageName   String            // e.g., "10-Day Physiotherapy Package"
  totalSessions Int               // e.g., 10
  startDate     DateTime @default(now())
  expiryDate    DateTime?         // optional — package validity window
  status        String   @default("active") // active | completed | expired
  notes         String?
  visits        PatientVisit[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("treatment_packages")
}

model PatientVisit {
  id             String   @id @default(cuid())
  packageId      String
  package        TreatmentPackage @relation(fields: [packageId], references: [id])
  visitDate      DateTime @default(now())
  visitNumber    Int               // 1, 2, 3, ... auto-incremented per package
  treatmentNotes String?           // what was done in this session
  markedBy       String?           // staff who recorded the visit
  createdAt      DateTime @default(now())

  @@map("patient_visits")
}
```

**Required relation updates to existing models (Section 6):**

```prisma
// Add to existing Patient model:
model Patient {
  // ... existing fields ...
  payments          Payment[]
  packages          TreatmentPackage[]   // ← NEW
}

// Add to existing Payment model:
model Payment {
  // ... existing fields ...
  package           TreatmentPackage?    // ← NEW (one-to-one: a payment may or may not create a package)
}
```

### 16.3 Integration with Payment Form (`/payment`)

The existing Payment page (Section 4.5 / `Payment.jsx`) gets a **package toggle** — no separate package creation page needed.

#### Changes to Payment Form

**Default session rate:** ₹600 per session (applies to initial line item and newly added service lines).

After the **Service Details** section, add:

- **"Package Payment"** toggle with teal icon (default: off)
- When toggled ON:
  - The first line item's **quantity auto-syncs** to the selected session count (e.g., selecting 10-Session Package sets qty=10, so total becomes 10 × ₹600 = ₹6,000)
  - Reveal package-specific fields:
    - **Package Type** — dropdown of common presets:
      - 5-Session Package (qty → 5)
      - 10-Session Package (qty → 10)
      - 15-Session Package (qty → 15)
      - Monthly Unlimited (qty → 30)
      - Custom (manual qty entry)
    - **Total Sessions** — number input (auto-filled from preset, editable; also syncs line item qty)
    - **Package Discount (₹)** — flat discount amount subtracted from the total (e.g., ₹6,000 - ₹1,000 discount = ₹5,000). Shown as a green "Package Discount -₹X" line in the totals breakdown. Resets to 0 when toggle is turned off.
    - **Expiry Date** — optional date picker (package validity window)
    - **Package Notes** — optional text
- When toggled OFF, line item qty resets to 1 and package discount resets to 0
- On payment submission (`POST /api/payments`), if the package toggle is ON, the backend **automatically creates a `TreatmentPackage`** linked to the new payment record using `prisma.$transaction()`. No separate API call needed from the frontend.

#### Totals Breakdown (when package is active with discount)

```
Subtotal                    ₹6,000
GST (if applicable)         ₹0
Package Discount            -₹1,000    ← green text, only shown when discount > 0
─────────────────────────────────────
TOTAL                       ₹5,000
```

#### Flow Example

1. Patient RF-0012 comes in, wants a 10-session package for ₹6,000 with ₹1,000 discount
2. Staff opens `/payment?patientId=RF-0012`
3. Toggles ON **"Package Payment"**
4. Selects preset "10-Session Package" → totalSessions auto-fills to 10, line item qty auto-updates to 10, subtotal shows ₹6,000
5. Enters Package Discount: ₹1,000 → total updates to ₹5,000
6. Clicks **Save Record**
7. Backend creates the Payment (₹5,000) AND the TreatmentPackage (10 sessions) in one atomic transaction

### 16.4 API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET    | `/api/admin/packages?patientId={id}` | List all packages for a patient (with visit counts) |
| GET    | `/api/admin/packages/:id` | Get package details with all visits |
| PATCH  | `/api/admin/packages/:id` | Update package (status, notes, expiry) |
| POST   | `/api/admin/packages/:id/visits` | Record a new visit (auto-increments visitNumber) |
| DELETE | `/api/admin/packages/:id/visits/:visitId` | Remove a wrongly recorded visit |

**Note:** There is no `POST /api/admin/packages` — packages are created automatically via the Payment route when the package toggle is ON. The existing `POST /api/payments` accepts optional package fields (`isPackage`, `packageName`, `totalSessions`, `expiryDate`, `packageNotes`) and handles both payment creation and package creation in a single atomic `prisma.$transaction()`.

### 16.5 Patient Edit Page (`/admin/patients/:id/edit`)

The patient edit page is focused purely on **editing patient enrollment details** (personal info, contact, program selection, goals). It does **not** include Packages & Visits — that functionality lives in the **Packages & Visits modal** on the Patients list page (Section 16.7), which provides a faster workflow for the doctor.

### 16.6 Integration with Admin Dashboard (`/admin/dashboard`)

Add to the existing stat cards row (Section 13.2):

- **Active Packages** — count of packages with `status: "active"` across all patients
- **Visits Today** — count of visits recorded today (`visitDate = today`)

Add a new section below the existing tables:

- **Packages Needing Attention** — table of packages with ≤ 2 sessions remaining:
  - Columns: Patient Name | Package | Sessions Used | Remaining | Last Visit Date
  - Links to the patient profile page for quick action

### 16.7 Integration with Patients List Page (`/admin/patients`)

Add a new column to the existing patients table (Section 13.3):

- **Package Status** column (after Payment Status):
  - Green badge: "Active (4/10)" — shows active package with progress
  - Blue badge: "Completed" — most recent package was completed
  - Red badge: "Expired (3/10)" — package expired with unused sessions
  - Grey text: "No package" — patient has no packages
  - If multiple active packages, show count: "2 active"

#### Packages & Visits Modal (Quick Visit Entry)

**Clicking the Pkg Status badge** or the **"Visits" action button** opens a full-featured modal overlay directly on the Patients list page. This is the **primary workflow for recording daily visits** — Dr. Neha never needs to navigate away from the patient list.

**Modal layout:**
- **Header:** Package icon + "Packages & Visits" title + patient name & ID + "New Package" button + close (X) button
- **Body (scrollable):** All packages for the patient, sorted by status (active first, then completed, then expired)
- Each package shown as a collapsible card (identical to the EditPatient packages section):
  - Package name + status badge (green/blue/red) + session progress text + receipt number
  - Progress bar showing `visitsDone / totalSessions`
  - Amber alert when ≤2 sessions remaining
  - Expanded detail: start date, expiry, remaining sessions, receipt number
  - **"Mark Visit" button** (active packages only) → inline form with date + treatment notes + Confirm/Cancel
  - Visit log table: Visit # | Date | Notes | Marked By | Delete action
- **Empty state:** "No treatment packages yet" with link to create one via Payment page

**UX benefits over the EditPatient page approach:**
- **Zero navigation** — doctor stays on the patient list, clicks badge, records visit, closes modal
- **Instant context switch** — can immediately move to the next patient without page loads
- **Badge updates in real-time** — after recording a visit, both the modal progress bar and the patient list badge refresh automatically
- **Consistent with clinical workflow** — doctor marks attendance at the start of each session while reviewing the patient list

### 16.8 Quick Visit Entry (Dashboard Shortcut)

Dr. Neha's most common action is recording that a patient showed up today. This should be fast and accessible from the dashboard:

1. **"Mark Visit" quick-action button** on the dashboard (next to existing action buttons)
2. Opens a modal:
   - Patient search (by name, ID, or mobile) — same search as existing patient lookup
   - Once selected, shows the patient's active package(s) with current progress
   - Click **"Mark Visit"** on the relevant package — one click records today's visit
   - Optional: add treatment notes before confirming
3. Modal closes, dashboard "Visits Today" stat updates

### 16.9 Business Rules

- A patient can have **multiple packages** (e.g., one completed, one active)
- A single payment creates **at most one** package (one-to-one relationship)
- Visits cannot exceed `totalSessions` — once all sessions are used, status auto-updates to `completed`
- If `expiryDate` is set and passes before all sessions are used, status auto-updates to `expired` (checked via a daily cron job or on-access check)
- Only admin/staff can record or delete visits
- Visit numbers are sequential per package (not global)
- Package inherits patient and amount info from its linked Payment — no duplicate data entry
- The `program` and `sessionType` from the Patient enrollment are used as defaults when displaying package context (e.g., "Physiotherapy — In-Person")

### 16.10 Patient-Facing View (Optional Future Enhancement)

On the patient's profile or a patient portal (if built), show a read-only view:

- Package name and total sessions
- Sessions completed and remaining
- Dates of all past visits
- Linked payment receipt for reference

