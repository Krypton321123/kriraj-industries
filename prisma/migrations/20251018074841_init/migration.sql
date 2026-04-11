BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[mstbrand] (
    [id] INT NOT NULL IDENTITY(1,1),
    [brandCode] NVARCHAR(1000) NOT NULL,
    [brandName] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [mstbrand_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[mstQuality] (
    [id] INT NOT NULL IDENTITY(1,1),
    [qualityCode] NVARCHAR(1000) NOT NULL,
    [qualityName] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [mstQuality_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[mstType] (
    [id] INT NOT NULL IDENTITY(1,1),
    [typeCode] NVARCHAR(1000) NOT NULL,
    [typeName] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [mstType_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[mstCategory] (
    [id] INT NOT NULL IDENTITY(1,1),
    [categoryCode] NVARCHAR(1000) NOT NULL,
    [categoryName] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [mstCategory_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[mstColor] (
    [id] INT NOT NULL IDENTITY(1,1),
    [colorCode] NVARCHAR(1000) NOT NULL,
    [colorName] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [mstColor_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[mstColorType] (
    [id] INT NOT NULL IDENTITY(1,1),
    [colorTypeCode] NVARCHAR(1000) NOT NULL,
    [colorTypeName] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [mstColorType_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[mstColorCompany] (
    [id] INT NOT NULL IDENTITY(1,1),
    [colorCompanyCode] NVARCHAR(1000) NOT NULL,
    [colorCompanyName] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [mstColorCompany_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[mstGlassQuality] (
    [id] INT NOT NULL IDENTITY(1,1),
    [glassQualityCode] NVARCHAR(1000) NOT NULL,
    [glassQualityName] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [mstGlassQuality_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[mstGlassType] (
    [id] INT NOT NULL IDENTITY(1,1),
    [glassTypeCode] NVARCHAR(1000) NOT NULL,
    [glassTypeName] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [mstGlassType_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[mstStickerType] (
    [id] INT NOT NULL IDENTITY(1,1),
    [stickerTypeCode] NVARCHAR(1000) NOT NULL,
    [stickerTypeName] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [mstStickerType_pkey] PRIMARY KEY CLUSTERED ([id])
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
