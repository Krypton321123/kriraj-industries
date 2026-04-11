BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[_comTaxTableTomstQuality] (
    [A] NVARCHAR(1000) NOT NULL,
    [B] INT NOT NULL,
    CONSTRAINT [_comTaxTableTomstQuality_AB_unique] UNIQUE NONCLUSTERED ([A],[B])
);

-- CreateTable
CREATE TABLE [dbo].[_comTaxTableTomstCategory] (
    [A] NVARCHAR(1000) NOT NULL,
    [B] INT NOT NULL,
    CONSTRAINT [_comTaxTableTomstCategory_AB_unique] UNIQUE NONCLUSTERED ([A],[B])
);

-- CreateTable
CREATE TABLE [dbo].[_comTaxTableTomstType] (
    [A] NVARCHAR(1000) NOT NULL,
    [B] INT NOT NULL,
    CONSTRAINT [_comTaxTableTomstType_AB_unique] UNIQUE NONCLUSTERED ([A],[B])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [_comTaxTableTomstQuality_B_index] ON [dbo].[_comTaxTableTomstQuality]([B]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [_comTaxTableTomstCategory_B_index] ON [dbo].[_comTaxTableTomstCategory]([B]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [_comTaxTableTomstType_B_index] ON [dbo].[_comTaxTableTomstType]([B]);

-- AddForeignKey
ALTER TABLE [dbo].[_comTaxTableTomstQuality] ADD CONSTRAINT [_comTaxTableTomstQuality_A_fkey] FOREIGN KEY ([A]) REFERENCES [dbo].[comTaxTable]([taxId]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[_comTaxTableTomstQuality] ADD CONSTRAINT [_comTaxTableTomstQuality_B_fkey] FOREIGN KEY ([B]) REFERENCES [dbo].[mstQuality]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[_comTaxTableTomstCategory] ADD CONSTRAINT [_comTaxTableTomstCategory_A_fkey] FOREIGN KEY ([A]) REFERENCES [dbo].[comTaxTable]([taxId]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[_comTaxTableTomstCategory] ADD CONSTRAINT [_comTaxTableTomstCategory_B_fkey] FOREIGN KEY ([B]) REFERENCES [dbo].[mstCategory]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[_comTaxTableTomstType] ADD CONSTRAINT [_comTaxTableTomstType_A_fkey] FOREIGN KEY ([A]) REFERENCES [dbo].[comTaxTable]([taxId]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[_comTaxTableTomstType] ADD CONSTRAINT [_comTaxTableTomstType_B_fkey] FOREIGN KEY ([B]) REFERENCES [dbo].[mstType]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
