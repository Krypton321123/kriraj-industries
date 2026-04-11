/*
  Warnings:

  - A unique constraint covering the columns `[customerCode]` on the table `mstCustomer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[salesmanCode]` on the table `mstSalesman` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[supplierCode]` on the table `mstSupplier` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- CreateIndex
ALTER TABLE [dbo].[mstCustomer] ADD CONSTRAINT [mstCustomer_customerCode_key] UNIQUE NONCLUSTERED ([customerCode]);

-- CreateIndex
ALTER TABLE [dbo].[mstSalesman] ADD CONSTRAINT [mstSalesman_salesmanCode_key] UNIQUE NONCLUSTERED ([salesmanCode]);

-- CreateIndex
ALTER TABLE [dbo].[mstSupplier] ADD CONSTRAINT [mstSupplier_supplierCode_key] UNIQUE NONCLUSTERED ([supplierCode]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
