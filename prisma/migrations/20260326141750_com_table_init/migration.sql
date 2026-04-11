/*
  Warnings:

  - You are about to drop the `taxTable` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropTable
DROP TABLE [dbo].[taxTable];

-- CreateTable
CREATE TABLE [dbo].[comTaxTable] (
    [taxId] NVARCHAR(1000) NOT NULL,
    [comName] NVARCHAR(1000) NOT NULL,
    [igst] INT NOT NULL,
    [cgst] INT NOT NULL,
    [sgst] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [comTaxTable_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [comTaxTable_pkey] PRIMARY KEY CLUSTERED ([taxId]),
    CONSTRAINT [comTaxTable_comName_key] UNIQUE NONCLUSTERED ([comName])
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
