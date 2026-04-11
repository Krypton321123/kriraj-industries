BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[trnPaymentItem] ADD [mstIncomeId] NVARCHAR(1000);

-- CreateTable
CREATE TABLE [dbo].[mstIncome] (
    [id] NVARCHAR(1000) NOT NULL,
    [incomeCode] NVARCHAR(1000) NOT NULL,
    [incomeName] NVARCHAR(1000) NOT NULL,
    [parentGroupId] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [mstIncome_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [mstIncome_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[mstIncome] ADD CONSTRAINT [mstIncome_parentGroupId_fkey] FOREIGN KEY ([parentGroupId]) REFERENCES [dbo].[ledgerParent]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[trnPaymentItem] ADD CONSTRAINT [trnPaymentItem_mstIncomeId_fkey] FOREIGN KEY ([mstIncomeId]) REFERENCES [dbo].[mstIncome]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
