/*
  Warnings:

  - A unique constraint covering the columns `[customerId]` on the table `RateList` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- CreateIndex
ALTER TABLE [dbo].[RateList] ADD CONSTRAINT [RateList_customerId_key] UNIQUE NONCLUSTERED ([customerId]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
