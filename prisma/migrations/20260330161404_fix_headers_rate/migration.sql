/*
  Warnings:

  - You are about to drop the column `frieghtTax` on the `RateList` table. All the data in the column will be lost.
  - You are about to drop the column `glassCostTax` on the `RateList` table. All the data in the column will be lost.
  - You are about to drop the column `paintTax` on the `RateList` table. All the data in the column will be lost.
  - You are about to drop the column `rawmatTax` on the `RateList` table. All the data in the column will be lost.
  - You are about to drop the column `stickerTax` on the `RateList` table. All the data in the column will be lost.
  - You are about to drop the column `frieght` on the `RateListItem` table. All the data in the column will be lost.
  - You are about to drop the column `glassCost` on the `RateListItem` table. All the data in the column will be lost.
  - You are about to drop the column `paint` on the `RateListItem` table. All the data in the column will be lost.
  - You are about to drop the column `rawMat` on the `RateListItem` table. All the data in the column will be lost.
  - You are about to drop the column `sticker` on the `RateListItem` table. All the data in the column will be lost.
  - Added the required column `freight` to the `RateListItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `margin` to the `RateListItem` table without a default value. This is not possible if the table is not empty.
  - Made the column `rateListId` on table `RateListItem` required. This step will fail if there are existing NULL values in that column.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[RateListItem] DROP CONSTRAINT [RateListItem_rateListId_fkey];

-- AlterTable
ALTER TABLE [dbo].[RateList] DROP COLUMN [frieghtTax],
[glassCostTax],
[paintTax],
[rawmatTax],
[stickerTax];

-- AlterTable
ALTER TABLE [dbo].[RateListItem] ALTER COLUMN [rateListId] NVARCHAR(1000) NOT NULL;
ALTER TABLE [dbo].[RateListItem] DROP COLUMN [frieght],
[glassCost],
[paint],
[rawMat],
[sticker];
ALTER TABLE [dbo].[RateListItem] ADD [freight] DECIMAL(18,2) NOT NULL,
[margin] DECIMAL(18,2) NOT NULL;

-- CreateTable
CREATE TABLE [dbo].[RateListColumn] (
    [id] NVARCHAR(1000) NOT NULL,
    [rateListId] NVARCHAR(1000) NOT NULL,
    [taxId] NVARCHAR(1000) NOT NULL,
    [columnIndex] INT NOT NULL,
    CONSTRAINT [RateListColumn_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[RateListValue] (
    [id] NVARCHAR(1000) NOT NULL,
    [itemId] NVARCHAR(1000) NOT NULL,
    [columnIndex] INT NOT NULL,
    [value] DECIMAL(18,2) NOT NULL,
    CONSTRAINT [RateListValue_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[RateListColumn] ADD CONSTRAINT [RateListColumn_rateListId_fkey] FOREIGN KEY ([rateListId]) REFERENCES [dbo].[RateList]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[RateListItem] ADD CONSTRAINT [RateListItem_rateListId_fkey] FOREIGN KEY ([rateListId]) REFERENCES [dbo].[RateList]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[RateListValue] ADD CONSTRAINT [RateListValue_itemId_fkey] FOREIGN KEY ([itemId]) REFERENCES [dbo].[RateListItem]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
