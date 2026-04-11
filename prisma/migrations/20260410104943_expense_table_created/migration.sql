BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[mstExpenses] (
    [id] NVARCHAR(1000) NOT NULL,
    [expenseCode] NVARCHAR(1000) NOT NULL,
    [expenseName] NVARCHAR(1000) NOT NULL,
    [parentGroupId] INT NOT NULL,
    CONSTRAINT [mstExpenses_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[mstExpenses] ADD CONSTRAINT [mstExpenses_parentGroupId_fkey] FOREIGN KEY ([parentGroupId]) REFERENCES [dbo].[ledgerParent]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
