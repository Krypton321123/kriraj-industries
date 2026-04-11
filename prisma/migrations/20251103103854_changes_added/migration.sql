BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[mstCustomer] ADD [aadharNumber] NVARCHAR(1000) NOT NULL CONSTRAINT [mstCustomer_aadharNumber_df] DEFAULT '',
[accountNumber] NVARCHAR(1000) NOT NULL CONSTRAINT [mstCustomer_accountNumber_df] DEFAULT '',
[bankBranch] NVARCHAR(1000) NOT NULL CONSTRAINT [mstCustomer_bankBranch_df] DEFAULT '',
[bankName] NVARCHAR(1000) NOT NULL CONSTRAINT [mstCustomer_bankName_df] DEFAULT '',
[ifscCode] NVARCHAR(1000) NOT NULL CONSTRAINT [mstCustomer_ifscCode_df] DEFAULT '',
[panNumber] NVARCHAR(1000) NOT NULL CONSTRAINT [mstCustomer_panNumber_df] DEFAULT '',
[status] NVARCHAR(1000) NOT NULL CONSTRAINT [mstCustomer_status_df] DEFAULT 'active';

-- AlterTable
ALTER TABLE [dbo].[mstSalesman] ADD [aadharNumber] NVARCHAR(1000) NOT NULL CONSTRAINT [mstSalesman_aadharNumber_df] DEFAULT '',
[accountNumber] NVARCHAR(1000) NOT NULL CONSTRAINT [mstSalesman_accountNumber_df] DEFAULT '',
[bankBranch] NVARCHAR(1000) NOT NULL CONSTRAINT [mstSalesman_bankBranch_df] DEFAULT '',
[bankName] NVARCHAR(1000) NOT NULL CONSTRAINT [mstSalesman_bankName_df] DEFAULT '',
[ifscCode] NVARCHAR(1000) NOT NULL CONSTRAINT [mstSalesman_ifscCode_df] DEFAULT '',
[panNumber] NVARCHAR(1000) NOT NULL CONSTRAINT [mstSalesman_panNumber_df] DEFAULT '',
[status] NVARCHAR(1000) NOT NULL CONSTRAINT [mstSalesman_status_df] DEFAULT 'active';

-- AlterTable
ALTER TABLE [dbo].[mstSupplier] ADD [aadharNumber] NVARCHAR(1000) NOT NULL CONSTRAINT [mstSupplier_aadharNumber_df] DEFAULT '',
[accountNumber] NVARCHAR(1000) NOT NULL CONSTRAINT [mstSupplier_accountNumber_df] DEFAULT '',
[bankBranch] NVARCHAR(1000) NOT NULL CONSTRAINT [mstSupplier_bankBranch_df] DEFAULT '',
[bankName] NVARCHAR(1000) NOT NULL CONSTRAINT [mstSupplier_bankName_df] DEFAULT '',
[ifscCode] NVARCHAR(1000) NOT NULL CONSTRAINT [mstSupplier_ifscCode_df] DEFAULT '',
[panNumber] NVARCHAR(1000) NOT NULL CONSTRAINT [mstSupplier_panNumber_df] DEFAULT '',
[status] NVARCHAR(1000) NOT NULL CONSTRAINT [mstSupplier_status_df] DEFAULT 'active';

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
