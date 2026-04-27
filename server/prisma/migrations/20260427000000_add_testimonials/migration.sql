-- CreateTable
CREATE TABLE "testimonials" (
    "id" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "patientInitials" TEXT,
    "age" INTEGER,
    "gender" TEXT,
    "condition" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "reviewText" TEXT NOT NULL,
    "videoUrl" TEXT,
    "photoUrl" TEXT,
    "treatmentDuration" TEXT,
    "outcome" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "consentGiven" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);
