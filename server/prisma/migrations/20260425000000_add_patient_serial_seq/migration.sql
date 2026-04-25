-- CreateSequence
CREATE SEQUENCE patient_serial_seq START 1 INCREMENT 1;

-- AlterTable: remove default from Patient.id (now set in application code)
ALTER TABLE "patients" ALTER COLUMN "id" DROP DEFAULT;
