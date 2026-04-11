/*
  Warnings:

  - Added the required column `customerId` to the `RateList` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[RateList] ADD [customerId] INT NOT NULL,
[frieghtTax] NVARCHAR(1000),
[glassCostTax] NVARCHAR(1000),
[paintTax] NVARCHAR(1000),
[rawmatTax] NVARCHAR(1000),
[stickerTax] NVARCHAR(1000);

-- AddForeignKey
ALTER TABLE [dbo].[RateList] ADD CONSTRAINT [RateList_customerId_fkey] FOREIGN KEY ([customerId]) REFERENCES [dbo].[mstCustomer]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
