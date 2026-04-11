BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[trnPurchase] (
    [id] INT NOT NULL IDENTITY(1,1),
    [purchaseCode] NVARCHAR(1000) NOT NULL,
    [purchaseDate] DATETIME2 NOT NULL,
    [supplierId] INT NOT NULL,
    [gstNumber] NVARCHAR(1000) NOT NULL,
    [mobileNumber] NVARCHAR(1000) NOT NULL,
    [subTotal] DECIMAL(18,2) NOT NULL,
    [sgst] DECIMAL(18,2) NOT NULL,
    [cgst] DECIMAL(18,2) NOT NULL,
    [igst] DECIMAL(18,2) NOT NULL,
    [totalTax] DECIMAL(18,2) NOT NULL,
    [freight] DECIMAL(18,2) NOT NULL,
    [roundOff] DECIMAL(18,2) NOT NULL,
    [nettAmount] DECIMAL(18,2) NOT NULL,
    [remarks] NVARCHAR(1000),
    [createdBy] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [trnPurchase_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [trnPurchase_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [trnPurchase_purchaseCode_key] UNIQUE NONCLUSTERED ([purchaseCode])
);

-- CreateTable
CREATE TABLE [dbo].[trnPurchaseItem] (
    [id] INT NOT NULL IDENTITY(1,1),
    [purchaseId] INT NOT NULL,
    [brandId] INT NOT NULL,
    [categoryId] INT NOT NULL,
    [typeId] INT NOT NULL,
    [qualityId] INT NOT NULL,
    [purchaseQty] DECIMAL(18,2) NOT NULL,
    [purchaseAmount] DECIMAL(18,2) NOT NULL,
    [purchaseRate] DECIMAL(18,2) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [trnPurchaseItem_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [trnPurchaseItem_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[trnPurchase] ADD CONSTRAINT [trnPurchase_supplierId_fkey] FOREIGN KEY ([supplierId]) REFERENCES [dbo].[mstSupplier]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[trnPurchaseItem] ADD CONSTRAINT [trnPurchaseItem_purchaseId_fkey] FOREIGN KEY ([purchaseId]) REFERENCES [dbo].[trnPurchase]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[trnPurchaseItem] ADD CONSTRAINT [trnPurchaseItem_brandId_fkey] FOREIGN KEY ([brandId]) REFERENCES [dbo].[mstbrand]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[trnPurchaseItem] ADD CONSTRAINT [trnPurchaseItem_categoryId_fkey] FOREIGN KEY ([categoryId]) REFERENCES [dbo].[mstCategory]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[trnPurchaseItem] ADD CONSTRAINT [trnPurchaseItem_typeId_fkey] FOREIGN KEY ([typeId]) REFERENCES [dbo].[mstType]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[trnPurchaseItem] ADD CONSTRAINT [trnPurchaseItem_qualityId_fkey] FOREIGN KEY ([qualityId]) REFERENCES [dbo].[mstQuality]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
