BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[mstExpenses] DROP CONSTRAINT [mstExpenses_parentGroupId_fkey];

-- CreateTable
CREATE TABLE [dbo].[trnPayment] (
    [id] INT NOT NULL IDENTITY(1,1),
    [paymentCode] NVARCHAR(1000) NOT NULL,
    [paymentDate] DATETIME2 NOT NULL,
    [paymentMode] NVARCHAR(1000) NOT NULL,
    [paymentLedgerId] INT NOT NULL,
    [totalAmount] DECIMAL(18,2) NOT NULL,
    [remarks] NVARCHAR(1000),
    [createdBy] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [trnPayment_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [trnPayment_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [trnPayment_paymentCode_key] UNIQUE NONCLUSTERED ([paymentCode])
);

-- CreateTable
CREATE TABLE [dbo].[trnPaymentItem] (
    [id] INT NOT NULL IDENTITY(1,1),
    [paymentId] INT NOT NULL,
    [expenseId] NVARCHAR(1000) NOT NULL,
    [receiptLedgerId] INT NOT NULL,
    [amount] DECIMAL(18,2) NOT NULL,
    [remarks] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [trnPaymentItem_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [trnPaymentItem_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[mstExpenses] ADD CONSTRAINT [mstExpenses_parentGroupId_fkey] FOREIGN KEY ([parentGroupId]) REFERENCES [dbo].[ledgerParent]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[trnPayment] ADD CONSTRAINT [trnPayment_paymentLedgerId_fkey] FOREIGN KEY ([paymentLedgerId]) REFERENCES [dbo].[generalLedgers]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[trnPaymentItem] ADD CONSTRAINT [trnPaymentItem_paymentId_fkey] FOREIGN KEY ([paymentId]) REFERENCES [dbo].[trnPayment]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[trnPaymentItem] ADD CONSTRAINT [trnPaymentItem_expenseId_fkey] FOREIGN KEY ([expenseId]) REFERENCES [dbo].[mstExpenses]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[trnPaymentItem] ADD CONSTRAINT [trnPaymentItem_receiptLedgerId_fkey] FOREIGN KEY ([receiptLedgerId]) REFERENCES [dbo].[generalLedgers]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
