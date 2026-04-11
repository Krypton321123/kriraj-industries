BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[generalLedgers] (
    [id] INT NOT NULL IDENTITY(1,1),
    [ledgerCode] NVARCHAR(1000) NOT NULL,
    [ledgerName] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    [openingBalance] NVARCHAR(1000) NOT NULL,
    [ledgerP] INT NOT NULL,
    CONSTRAINT [generalLedgers_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ledgerParent] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [ledgerParent_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[generalLedgers] ADD CONSTRAINT [generalLedgers_ledgerP_fkey] FOREIGN KEY ([ledgerP]) REFERENCES [dbo].[ledgerParent]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
