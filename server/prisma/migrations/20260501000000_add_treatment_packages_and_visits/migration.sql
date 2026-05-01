-- CreateTable
CREATE TABLE "treatment_packages" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "totalSessions" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treatment_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_visits" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visitNumber" INTEGER NOT NULL,
    "treatmentNotes" TEXT,
    "markedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_visits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "treatment_packages_paymentId_key" ON "treatment_packages"("paymentId");

-- AddForeignKey
ALTER TABLE "treatment_packages" ADD CONSTRAINT "treatment_packages_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_packages" ADD CONSTRAINT "treatment_packages_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_visits" ADD CONSTRAINT "patient_visits_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "treatment_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
