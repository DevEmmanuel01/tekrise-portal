-- CreateTable
CREATE TABLE "StudentEnquiry" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "track" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentEnquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "matricPin" INTEGER NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "track" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "acceptedTermsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TuitionPayment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentEmail" TEXT NOT NULL,
    "cohortCode" TEXT NOT NULL DEFAULT 'COHORT-04',
    "amountKobo" INTEGER NOT NULL,
    "installmentPhase" TEXT NOT NULL,
    "paystackReference" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TuitionPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TuitionPaymentAttempt" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentEmail" TEXT NOT NULL,
    "amountKobo" INTEGER NOT NULL,
    "providerReference" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'BANK_TRANSFER',
    "status" TEXT NOT NULL,
    "failureReason" TEXT,
    "ipAddress" TEXT,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TuitionPaymentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyllabusChunk" (
    "id" TEXT NOT NULL,
    "track" TEXT NOT NULL,
    "documentTitle" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "tokenCount" INTEGER NOT NULL,
    "embeddingJson" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyllabusChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationCode" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_matricPin_key" ON "Student"("matricPin");

-- CreateIndex
CREATE INDEX "Student_track_idx" ON "Student"("track");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_studentId_idx" ON "Session"("studentId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "TuitionPayment_paystackReference_key" ON "TuitionPayment"("paystackReference");

-- CreateIndex
CREATE INDEX "TuitionPayment_studentId_idx" ON "TuitionPayment"("studentId");

-- CreateIndex
CREATE INDEX "TuitionPayment_paidAt_idx" ON "TuitionPayment"("paidAt");

-- CreateIndex
CREATE UNIQUE INDEX "TuitionPaymentAttempt_providerReference_key" ON "TuitionPaymentAttempt"("providerReference");

-- CreateIndex
CREATE INDEX "TuitionPaymentAttempt_studentId_attemptedAt_idx" ON "TuitionPaymentAttempt"("studentId", "attemptedAt");

-- CreateIndex
CREATE INDEX "TuitionPaymentAttempt_status_idx" ON "TuitionPaymentAttempt"("status");

-- CreateIndex
CREATE INDEX "SyllabusChunk_track_idx" ON "SyllabusChunk"("track");

-- CreateIndex
CREATE UNIQUE INDEX "SyllabusChunk_documentTitle_chunkIndex_key" ON "SyllabusChunk"("documentTitle", "chunkIndex");

-- CreateIndex
CREATE INDEX "VerificationCode_studentId_code_idx" ON "VerificationCode"("studentId", "code");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TuitionPayment" ADD CONSTRAINT "TuitionPayment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TuitionPaymentAttempt" ADD CONSTRAINT "TuitionPaymentAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationCode" ADD CONSTRAINT "VerificationCode_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
