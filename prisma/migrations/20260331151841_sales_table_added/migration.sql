BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[mstCustomer] ADD [salesmanId] INT;

-- CreateTable
CREATE TABLE [dbo].[mstSalesType] (
    [id] INT NOT NULL IDENTITY(1,1),
    [code] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [mstSalesType_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [mstSalesType_code_key] UNIQUE NONCLUSTERED ([code])
);

-- CreateTable
CREATE TABLE [dbo].[trnSales] (
    [id] INT NOT NULL IDENTITY(1,1),
    [salesCode] NVARCHAR(1000) NOT NULL,
    [salesDate] DATETIME2 NOT NULL,
    [customerId] INT NOT NULL,
    [salesmanId] INT,
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
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [trnSales_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [trnSales_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [trnSales_salesCode_key] UNIQUE NONCLUSTERED ([salesCode])
);

-- CreateTable
CREATE TABLE [dbo].[trnSalesItem] (
    [id] INT NOT NULL IDENTITY(1,1),
    [salesId] INT NOT NULL,
    [salesTypeId] INT NOT NULL,
    [brandId] INT,
    [categoryId] INT,
    [typeId] INT,
    [qualityId] INT,
    [qty] DECIMAL(18,2) NOT NULL,
    [rate] DECIMAL(18,2) NOT NULL,
    [amount] DECIMAL(18,2) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [trnSalesItem_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [trnSalesItem_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[mstCustomer] ADD CONSTRAINT [mstCustomer_salesmanId_fkey] FOREIGN KEY ([salesmanId]) REFERENCES [dbo].[mstSalesman]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[trnSales] ADD CONSTRAINT [trnSales_customerId_fkey] FOREIGN KEY ([customerId]) REFERENCES [dbo].[mstCustomer]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[trnSales] ADD CONSTRAINT [trnSales_salesmanId_fkey] FOREIGN KEY ([salesmanId]) REFERENCES [dbo].[mstSalesman]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[trnSalesItem] ADD CONSTRAINT [trnSalesItem_salesId_fkey] FOREIGN KEY ([salesId]) REFERENCES [dbo].[trnSales]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[trnSalesItem] ADD CONSTRAINT [trnSalesItem_salesTypeId_fkey] FOREIGN KEY ([salesTypeId]) REFERENCES [dbo].[mstSalesType]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[trnSalesItem] ADD CONSTRAINT [trnSalesItem_brandId_fkey] FOREIGN KEY ([brandId]) REFERENCES [dbo].[mstbrand]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[trnSalesItem] ADD CONSTRAINT [trnSalesItem_categoryId_fkey] FOREIGN KEY ([categoryId]) REFERENCES [dbo].[mstCategory]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[trnSalesItem] ADD CONSTRAINT [trnSalesItem_typeId_fkey] FOREIGN KEY ([typeId]) REFERENCES [dbo].[mstType]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[trnSalesItem] ADD CONSTRAINT [trnSalesItem_qualityId_fkey] FOREIGN KEY ([qualityId]) REFERENCES [dbo].[mstQuality]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
