## MASTERS: 
 - SALESMAN MASTER: 
 --  ID, salesman_code, salesman_name, salesman_address, city, state, mobile_number  
 
 - Customer Master: 
 --  ID, customer_code, customer_name, customer_address, city, state, mobile_number, opening_balance, createdAt, createdBy, gstNumber

- Supplier Master: 
-- ID, supplier_code, supplier_name, supplier_address, city, state, mobile_number, opening_balance, createdAt createdBy, gstNumber

- BANK MASTER: 
-- ID, bankCode, bankName, 

- GENERAL LEDGERS 
-- ID, LEDGER CODE, LEDGER NAME, CREATED AT, STATUS (ACTIVE / INACTIVE), LEDGER PARENT (relation), OPENING_BALANCE (-ve VALUES),  Round off digit

- LEDGER PARENT: 
-- ID, LP NAME

AADHAR NUMBER, PANNUMBER, BANKNAME, BANK BRANCH, ACCOUNT NUMBER IFSC CODE, STATUS ACTIVE INACTIVE
Customer code should be categorised in two forms - new and editing, once the record gets saved to the backend then the code should be generated and saved right then and there.

FIX SEARCH
Print Name(default original name), in everything 

## TRANSACTIONS 
