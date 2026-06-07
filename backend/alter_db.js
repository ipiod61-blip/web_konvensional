const mysql = require('mysql2/promise');
require('dotenv').config();

async function alterDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Connected to MySQL server.');

        // Alter transactions table to add payment fields
        await connection.query(`
            ALTER TABLE transactions 
            ADD COLUMN payment_method ENUM('tunai', 'qris', 'debit') DEFAULT 'tunai' AFTER total_price,
            ADD COLUMN amount_paid DECIMAL(15, 2) NOT NULL DEFAULT 0 AFTER payment_method,
            ADD COLUMN change_amount DECIMAL(15, 2) NOT NULL DEFAULT 0 AFTER amount_paid
        `);
        console.log('transactions table altered successfully.');

        await connection.end();
        process.exit(0);
    } catch (error) {
        // If columns already exist, it will throw an error, we can just catch and ignore or log it
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Columns already exist, skipping alter.');
            process.exit(0);
        } else {
            console.error('Error altering database:', error);
            process.exit(1);
        }
    }
}

alterDatabase();
