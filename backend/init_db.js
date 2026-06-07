const mysql = require('mysql2/promise');
require('dotenv').config();
const bcrypt = require('bcrypt');

async function initializeDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        console.log('Connected to MySQL server.');

        // Recreate database for fresh start with new schema
        await connection.query(`DROP DATABASE IF EXISTS \`${process.env.DB_NAME}\`;`);
        await connection.query(`CREATE DATABASE \`${process.env.DB_NAME}\`;`);
        console.log(`Database ${process.env.DB_NAME} recreated.`);

        await connection.query(`USE \`${process.env.DB_NAME}\`;`);

        // 1. Audit Logs
        await connection.query(`
            CREATE TABLE audit_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                action ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
                table_name VARCHAR(100) NOT NULL,
                record_id INT,
                old_data JSON,
                new_data JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Employees
        await connection.query(`
            CREATE TABLE employees (
                id INT AUTO_INCREMENT PRIMARY KEY,
                kode_karyawan VARCHAR(50) NOT NULL UNIQUE,
                name VARCHAR(255) NOT NULL,
                username VARCHAR(100) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('kasir', 'manajemen') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP NULL
            );
        `);

        // 3. Suppliers
        await connection.query(`
            CREATE TABLE suppliers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                kode_supplier VARCHAR(50) NOT NULL UNIQUE,
                name VARCHAR(255) NOT NULL,
                address TEXT,
                phone VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP NULL
            );
        `);

        // 4. Items
        await connection.query(`
            CREATE TABLE items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                kode_barang VARCHAR(50) NOT NULL UNIQUE,
                name VARCHAR(255) NOT NULL,
                merk VARCHAR(100),
                kategori VARCHAR(100),
                price DECIMAL(10, 2) NOT NULL,
                stock INT NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP NULL
            );
        `);

        // 5. Purchase Requests
        await connection.query(`
            CREATE TABLE purchase_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                kode_permintaan VARCHAR(50) NOT NULL UNIQUE,
                supplier_id INT,
                created_by INT,
                request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status ENUM('pending', 'partial', 'completed') DEFAULT 'pending',
                deleted_at TIMESTAMP NULL,
                FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
                FOREIGN KEY (created_by) REFERENCES employees(id)
            );
        `);

        await connection.query(`
            CREATE TABLE purchase_request_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                request_id INT,
                item_id INT,
                quantity_requested INT NOT NULL,
                deleted_at TIMESTAMP NULL,
                FOREIGN KEY (request_id) REFERENCES purchase_requests(id),
                FOREIGN KEY (item_id) REFERENCES items(id)
            );
        `);

        // 6. Goods Inward
        await connection.query(`
            CREATE TABLE goods_inward (
                id INT AUTO_INCREMENT PRIMARY KEY,
                invoice_number VARCHAR(100) NOT NULL,
                request_id INT,
                verified_by INT,
                received_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP NULL,
                FOREIGN KEY (request_id) REFERENCES purchase_requests(id),
                FOREIGN KEY (verified_by) REFERENCES employees(id)
            );
        `);

        await connection.query(`
            CREATE TABLE goods_inward_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                goods_inward_id INT,
                item_id INT,
                quantity_received INT NOT NULL,
                deleted_at TIMESTAMP NULL,
                FOREIGN KEY (goods_inward_id) REFERENCES goods_inward(id),
                FOREIGN KEY (item_id) REFERENCES items(id)
            );
        `);

        // 7. Transactions
        await connection.query(`
            CREATE TABLE transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                kode_transaksi VARCHAR(50) NOT NULL UNIQUE,
                employee_id INT,
                transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                total_price DECIMAL(15, 2) NOT NULL,
                payment_method VARCHAR(50) DEFAULT 'tunai',
                amount_paid DECIMAL(15, 2) DEFAULT 0,
                change_amount DECIMAL(15, 2) DEFAULT 0,
                deleted_at TIMESTAMP NULL,
                FOREIGN KEY (employee_id) REFERENCES employees(id)
            );
        `);

        await connection.query(`
            CREATE TABLE transaction_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                transaction_id INT,
                item_id INT,
                quantity_sold INT NOT NULL,
                price_per_unit DECIMAL(10, 2) NOT NULL,
                deleted_at TIMESTAMP NULL,
                FOREIGN KEY (transaction_id) REFERENCES transactions(id),
                FOREIGN KEY (item_id) REFERENCES items(id)
            );
        `);

        console.log('All tables created successfully with new schema.');

        // Insert dummy data
        const currentYear = new Date().getFullYear();
        const passwordKasir = await bcrypt.hash('kasir123', 10);
        const passwordManajemen = await bcrypt.hash('manajemen123', 10);

        await connection.query(`INSERT INTO employees (kode_karyawan, name, username, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
            [`${currentYear}KSR001`, 'Kasir 1', 'kasir', passwordKasir, 'kasir']);
        await connection.query(`INSERT INTO employees (kode_karyawan, name, username, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
            [`${currentYear}MJM001`, 'Manajer 1', 'manajemen', passwordManajemen, 'manajemen']);

        // await connection.query(`INSERT INTO suppliers (kode_supplier, name, address, phone) VALUES (?, ?, ?, ?)`,
        //     ['SUPPJ001', 'PT Jaya Beton', 'Jl. Industri No 1', '08123456789']);
        // await connection.query(`INSERT INTO suppliers (kode_supplier, name, address, phone) VALUES (?, ?, ?, ?)`,
        //     ['SUPCS002', 'CV Semen Kuat', 'Jl. Bangunan No 2', '08987654321']);

        // Insert Dummy Items
        // await connection.query(`INSERT INTO items (kode_barang, name, merk, kategori, price, stock) VALUES (?, ?, ?, ?, ?, ?)`,
        //     ['SMNTIGBRG001', 'Semen Tiga Roda 50kg', 'Tiga Roda', 'Semen', 65000, 100]);
        // await connection.query(`INSERT INTO items (kode_barang, name, merk, kategori, price, stock) VALUES (?, ?, ?, ?, ?, ?)`,
        //     ['CATDULBRG001', 'Cat Dulux 25kg', 'Dulux', 'Cat Tembok', 125000, 50]);
        // await connection.query(`INSERT INTO items (kode_barang, name, merk, kategori, price, stock) VALUES (?, ?, ?, ?, ?, ?)`,
        //     ['PKUNOBBRG001', 'Paku Payung', 'No Brand', 'Paku', 15000, 200]);

        console.log('Database initialization completed.');
        await connection.end();
        process.exit(0);

    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

initializeDatabase();
