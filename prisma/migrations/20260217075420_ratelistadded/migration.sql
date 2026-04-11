BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[RateList] (
    [id] NVARCHAR(1000) NOT NULL,
    [date] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [RateList_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[RateListItem] (
    [id] NVARCHAR(1000) NOT NULL,
    [brandId] INT NOT NULL,
    [categoryId] INT NOT NULL,
    [typeId] INT NOT NULL,
    [qualityId] INT NOT NULL,
    [rawMat] DECIMAL(18,2) NOT NULL,
    [sticker] DECIMAL(18,2) NOT NULL,
    [glassCost] DECIMAL(18,2) NOT NULL,
    [frieght] DECIMAL(18,2) NOT NULL,
    [paint] DECIMAL(18,2) NOT NULL,
    [labour] DECIMAL(18,2) NOT NULL,
    [packing] DECIMAL(18,2) NOT NULL,
    [rateListId] NVARCHAR(1000),
    CONSTRAINT [RateListItem_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[RateListItem] ADD CONSTRAINT [RateListItem_brandId_fkey] FOREIGN KEY ([brandId]) REFERENCES [dbo].[mstbrand]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[RateListItem] ADD CONSTRAINT [RateListItem_categoryId_fkey] FOREIGN KEY ([categoryId]) REFERENCES [dbo].[mstCategory]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[RateListItem] ADD CONSTRAINT [RateListItem_typeId_fkey] FOREIGN KEY ([typeId]) REFERENCES [dbo].[mstType]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[RateListItem] ADD CONSTRAINT [RateListItem_qualityId_fkey] FOREIGN KEY ([qualityId]) REFERENCES [dbo].[mstQuality]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[RateListItem] ADD CONSTRAINT [RateListItem_rateListId_fkey] FOREIGN KEY ([rateListId]) REFERENCES [dbo].[RateList]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
