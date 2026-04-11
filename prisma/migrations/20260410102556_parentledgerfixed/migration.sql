/*
  Warnings:

  - Added the required column `systemLedgerId` to the `ledgerParent` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[ledgerParent] ADD [systemLedgerId] NVARCHAR(1000) NOT NULL;

-- AddForeignKey
ALTER TABLE [dbo].[ledgerParent] ADD CONSTRAINT [ledgerParent_systemLedgerId_fkey] FOREIGN KEY ([systemLedgerId]) REFERENCES [dbo].[mstSystemLedgers]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
