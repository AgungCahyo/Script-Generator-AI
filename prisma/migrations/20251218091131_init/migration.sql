-- CreateTable
CREATE TABLE "Script" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "script" TEXT,
    "audioUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Script_pkey" PRIMARY KEY ("id")
);
