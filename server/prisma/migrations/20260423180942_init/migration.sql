-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "bloodGroup" TEXT,
    "mobile" TEXT NOT NULL,
    "alternateMobile" TEXT,
    "email" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pinCode" TEXT,
    "emergencyName" TEXT NOT NULL,
    "emergencyPhone" TEXT NOT NULL,
    "emergencyRelation" TEXT NOT NULL,
    "program" TEXT[],
    "sessionType" TEXT NOT NULL,
    "preferredDays" TEXT[],
    "preferredTime" TEXT NOT NULL,
    "medicalConditions" TEXT,
    "pastSurgeries" TEXT,
    "medications" TEXT,
    "allergies" TEXT,
    "conditions" TEXT[],
    "painAreas" TEXT[],
    "painDuration" TEXT,
    "painSeverity" INTEGER,
    "fitnessGoals" TEXT[],
    "fitnessLevel" TEXT,
    "referralSource" TEXT,
    "insuranceProvider" TEXT,
    "insurancePolicy" TEXT,
    "paymentPreference" TEXT,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "signature" TEXT,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "receiptNo" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "sessionNo" INTEGER,
    "sessionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionDuration" TEXT,
    "services" JSONB NOT NULL,
    "subTotal" DOUBLE PRECISION NOT NULL,
    "gst" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "amountPaid" DOUBLE PRECISION NOT NULL,
    "balanceDue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "advancePaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentMode" TEXT NOT NULL,
    "transactionId" TEXT,
    "paymentDetails" JSONB,
    "status" TEXT NOT NULL DEFAULT 'paid',
    "remarks" TEXT,
    "collectedBy" TEXT NOT NULL DEFAULT 'Staff',
    "staffSignature" TEXT,
    "patientSignature" TEXT,
    "authorisedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_inquiries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "contact_inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'staff',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patients_mobile_key" ON "patients"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "payments_receiptNo_key" ON "payments"("receiptNo");

-- CreateIndex
CREATE UNIQUE INDEX "staff_email_key" ON "staff"("email");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
