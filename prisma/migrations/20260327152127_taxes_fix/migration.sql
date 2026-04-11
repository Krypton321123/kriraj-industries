/*
  Warnings:

  - You are about to drop the column `taxId` on the `mstbrand` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[mstbrand] DROP CONSTRAINT [mstbrand_taxId_fkey];

-- AlterTable
ALTER TABLE [dbo].[mstbrand] DROP COLUMN [taxId];

-- CreateTable
CREATE TABLE [dbo].[_comTaxTableTomstbrand] (
    [A] NVARCHAR(1000) NOT NULL,
    [B] INT NOT NULL,
    CONSTRAINT [_comTaxTableTomstbrand_AB_unique] UNIQUE NONCLUSTERED ([A],[B])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [_comTaxTableTomstbrand_B_index] ON [dbo].[_comTaxTableTomstbrand]([B]);

-- AddForeignKey
ALTER TABLE [dbo].[_comTaxTableTomstbrand] ADD CONSTRAINT [_comTaxTableTomstbrand_A_fkey] FOREIGN KEY ([A]) REFERENCES [dbo].[comTaxTable]([taxId]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[_comTaxTableTomstbrand] ADD CONSTRAINT [_comTaxTableTomstbrand_B_fkey] FOREIGN KEY ([B]) REFERENCES [dbo].[mstbrand]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
