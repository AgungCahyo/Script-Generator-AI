/*
  Warnings:

  - The values [MONTHLY_GRANT,ROLLOVER] on the enum `CreditTransactionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Subscription` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CreditTransactionType_new" AS ENUM ('PURCHASE', 'USAGE', 'REFUND', 'BONUS');
ALTER TABLE "CreditTransaction" ALTER COLUMN "type" TYPE "CreditTransactionType_new" USING ("type"::text::"CreditTransactionType_new");
ALTER TYPE "CreditTransactionType" RENAME TO "CreditTransactionType_old";
ALTER TYPE "CreditTransactionType_new" RENAME TO "CreditTransactionType";
DROP TYPE "public"."CreditTransactionType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_userId_fkey";

-- DropTable
DROP TABLE "Subscription";

-- DropEnum
DROP TYPE "Plan";

-- DropEnum
DROP TYPE "SubscriptionStatus";
