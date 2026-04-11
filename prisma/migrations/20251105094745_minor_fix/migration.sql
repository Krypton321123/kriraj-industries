/*
  Warnings:

  - A unique constraint covering the columns `[brandCode]` on the table `mstbrand` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[categoryCode]` on the table `mstCategory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[qualityCode]` on the table `mstQuality` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[typeCode]` on the table `mstType` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- CreateIndex
ALTER TABLE [dbo].[mstbrand] ADD CONSTRAINT [mstbrand_brandCode_key] UNIQUE NONCLUSTERED ([brandCode]);

-- CreateIndex
ALTER TABLE [dbo].[mstCategory] ADD CONSTRAINT [mstCategory_categoryCode_key] UNIQUE NONCLUSTERED ([categoryCode]);

-- CreateIndex
ALTER TABLE [dbo].[mstQuality] ADD CONSTRAINT [mstQuality_qualityCode_key] UNIQUE NONCLUSTERED ([qualityCode]);

-- CreateIndex
ALTER TABLE [dbo].[mstType] ADD CONSTRAINT [mstType_typeCode_key] UNIQUE NONCLUSTERED ([typeCode]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
