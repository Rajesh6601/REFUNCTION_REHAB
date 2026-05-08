-- Change default slot duration from 30 to 45 minutes
ALTER TABLE "doctor_availability" ALTER COLUMN "slotDuration" SET DEFAULT 45;

-- Update existing 60-minute slots to 45 minutes
UPDATE "doctor_availability" SET "slotDuration" = 45 WHERE "slotDuration" = 60;
