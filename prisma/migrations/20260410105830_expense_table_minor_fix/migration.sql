/*
  Warnings:

  - Added the required column `updatedAt` to the `mstExpenses` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[mstExpenses] ADD [createdAt] DATETIME2 NOT NULL CONSTRAINT [mstExpenses_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
[updatedAt] DATETIME2 NOT NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
