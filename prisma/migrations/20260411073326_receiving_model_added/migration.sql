BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[trnReceiving] (
    [id] INT NOT NULL IDENTITY(1,1),
    [receivingCode] NVARCHAR(1000) NOT NULL,
    [receivingDate] DATETIME2 NOT NULL,
    [paymentMode] NVARCHAR(1000) NOT NULL,
    [paymentLedgerId] INT NOT NULL,
    [totalAmount] DECIMAL(18,2) NOT NULL,
    [remarks] NVARCHAR(1000),
    [createdBy] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [trnReceiving_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [trnReceiving_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [trnReceiving_receivingCode_key] UNIQUE NONCLUSTERED ([receivingCode])
);

-- CreateTable
CREATE TABLE [dbo].[trnReceivingItem] (
    [id] INT NOT NULL IDENTITY(1,1),
    [receivingId] INT NOT NULL,
    [incomeId] NVARCHAR(1000) NOT NULL,
    [receiptLedgerId] INT NOT NULL,
    [amount] DECIMAL(18,2) NOT NULL,
    [remarks] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [trnReceivingItem_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [trnReceivingItem_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[trnReceiving] ADD CONSTRAINT [trnReceiving_paymentLedgerId_fkey] FOREIGN KEY ([paymentLedgerId]) REFERENCES [dbo].[generalLedgers]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[trnReceivingItem] ADD CONSTRAINT [trnReceivingItem_receivingId_fkey] FOREIGN KEY ([receivingId]) REFERENCES [dbo].[trnReceiving]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[trnReceivingItem] ADD CONSTRAINT [trnReceivingItem_incomeId_fkey] FOREIGN KEY ([incomeId]) REFERENCES [dbo].[mstIncome]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[trnReceivingItem] ADD CONSTRAINT [trnReceivingItem_receiptLedgerId_fkey] FOREIGN KEY ([receiptLedgerId]) REFERENCES [dbo].[generalLedgers]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
