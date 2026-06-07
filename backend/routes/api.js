const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const { verifyToken, isManajemen, isKasir } = require('../middlewares/auth');
const logAudit = require('../utils/auditLogger');
const CodeGenerator = require('../utils/codeGenerator');

// --- EMPLOYEES ---
router.get('/employees', [verifyToken, isManajemen], async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, kode_karyawan, name, username, role, created_at FROM employees WHERE deleted_at IS NULL');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/employees', [verifyToken, isManajemen], async (req, res) => {
    try {
        const { name, username, password, role } = req.body;
        const kode = await CodeGenerator.generateEmployeeCode(role);
        const hash = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            'INSERT INTO employees (kode_karyawan, name, username, password_hash, role) VALUES (?, ?, ?, ?, ?)',
            [kode, name, username, hash, role]
        );

        const newData = { kode_karyawan: kode, name, username, role };
        await logAudit('CREATE', 'employees', result.insertId, req.user.id, null, newData);

        res.status(201).json({ message: 'Employee created', id: result.insertId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/employees/:id', [verifyToken, isManajemen], async (req, res) => {
    try {
        const { name, username, password, role } = req.body;
        const [oldDataRows] = await db.query('SELECT name, username, role FROM employees WHERE id = ?', [req.params.id]);

        let query = 'UPDATE employees SET name = ?, username = ?, role = ?';
        let params = [name, username, role];

        if (password) {
            query += ', password_hash = ?';
            const hash = await bcrypt.hash(password, 10);
            params.push(hash);
        }

        query += ' WHERE id = ?';
        params.push(req.params.id);

        await db.query(query, params);

        const newData = { name, username, role }; // Don't log password
        await logAudit('UPDATE', 'employees', req.params.id, req.user.id, oldDataRows[0], newData);

        res.json({ message: 'Employee updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/employees/:id', [verifyToken, isManajemen], async (req, res) => {
    try {
        const [oldDataRows] = await db.query('SELECT name, username, role FROM employees WHERE id = ?', [req.params.id]);
        await db.query('UPDATE employees SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [req.params.id]);
        await logAudit('DELETE', 'employees', req.params.id, req.user.id, oldDataRows[0], null);
        res.json({ message: 'Employee deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- SUPPLIERS ---
router.get('/suppliers', [verifyToken, isManajemen], async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM suppliers WHERE deleted_at IS NULL');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/suppliers', [verifyToken, isManajemen], async (req, res) => {
    try {
        const { name, address, phone } = req.body;
        const kode = await CodeGenerator.generateSupplierCode(name);

        const [result] = await db.query(
            'INSERT INTO suppliers (kode_supplier, name, address, phone) VALUES (?, ?, ?, ?)',
            [kode, name, address, phone]
        );

        const newData = { kode_supplier: kode, name, address, phone };
        await logAudit('CREATE', 'suppliers', result.insertId, req.user.id, null, newData);

        res.status(201).json({ message: 'Supplier created' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/suppliers/:id', [verifyToken, isManajemen], async (req, res) => {
    try {
        const { name, address, phone } = req.body;
        const [oldDataRows] = await db.query('SELECT name, address, phone FROM suppliers WHERE id = ?', [req.params.id]);

        await db.query(
            'UPDATE suppliers SET name = ?, address = ?, phone = ? WHERE id = ?',
            [name, address, phone, req.params.id]
        );

        const newData = { name, address, phone };
        await logAudit('UPDATE', 'suppliers', req.params.id, req.user.id, oldDataRows[0], newData);

        res.json({ message: 'Supplier updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/suppliers/:id', [verifyToken, isManajemen], async (req, res) => {
    try {
        const [oldDataRows] = await db.query('SELECT name, address, phone FROM suppliers WHERE id = ?', [req.params.id]);
        await db.query('UPDATE suppliers SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [req.params.id]);
        await logAudit('DELETE', 'suppliers', req.params.id, req.user.id, oldDataRows[0], null);
        res.json({ message: 'Supplier deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- ITEMS ---
router.get('/items', [verifyToken], async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM items WHERE deleted_at IS NULL');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/items', [verifyToken, isManajemen], async (req, res) => {
    try {
        const { name, merk, kategori, price } = req.body;
        const kode = await CodeGenerator.generateItemCode(name, merk);

        const [result] = await db.query(
            'INSERT INTO items (kode_barang, name, merk, kategori, price) VALUES (?, ?, ?, ?, ?)',
            [kode, name, merk, kategori, price]
        );

        const newData = { kode_barang: kode, name, merk, kategori, price };
        await logAudit('CREATE', 'items', result.insertId, req.user.id, null, newData);

        res.status(201).json({ message: 'Item created' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/items/:id', [verifyToken, isManajemen], async (req, res) => {
    try {
        const { price } = req.body; // Restriction Phase 3: Only Price
        const [oldDataRows] = await db.query('SELECT price FROM items WHERE id = ?', [req.params.id]);

        await db.query(
            'UPDATE items SET price = ? WHERE id = ?',
            [price, req.params.id]
        );

        const newData = { price };
        await logAudit('UPDATE', 'items', req.params.id, req.user.id, oldDataRows[0], newData);

        res.json({ message: 'Item updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/items/:id', [verifyToken, isManajemen], async (req, res) => {
    try {
        const [oldDataRows] = await db.query('SELECT name FROM items WHERE id = ?', [req.params.id]);
        await db.query('UPDATE items SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [req.params.id]);
        await logAudit('DELETE', 'items', req.params.id, req.user.id, oldDataRows[0], null);
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- TRANSACTIONS ---
router.post('/transactions', [verifyToken, isKasir], async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { items, totalPrice, payment_method, amount_paid, change_amount } = req.body;
        const employeeId = req.user.id;

        // Phase 3 Validation: Must be paid in full
        if (amount_paid < totalPrice) {
            throw new Error('Pembayaran kurang. Transaksi wajib lunas.');
        }

        const kode = await CodeGenerator.generateTransactionCode();

        const [txResult] = await connection.query(
            'INSERT INTO transactions (kode_transaksi, employee_id, total_price, payment_method, amount_paid, change_amount) VALUES (?, ?, ?, ?, ?, ?)',
            [kode, employeeId, totalPrice, payment_method, amount_paid, change_amount]
        );
        const transactionId = txResult.insertId;

        for (const item of items) {
            const [stockRows] = await connection.query('SELECT stock FROM items WHERE id = ? AND deleted_at IS NULL FOR UPDATE', [item.item_id]);
            if (!stockRows.length || stockRows[0].stock < item.quantity) {
                throw new Error(`Stok tidak mencukupi untuk barang ID ${item.item_id}`);
            }

            await connection.query(
                'UPDATE items SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.item_id]
            );

            await connection.query(
                'INSERT INTO transaction_items (transaction_id, item_id, quantity_sold, price_per_unit) VALUES (?, ?, ?, ?)',
                [transactionId, item.item_id, item.quantity, item.price_per_unit]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Transaction successful', transactionId, kode });
    } catch (err) {
        await connection.rollback();
        res.status(400).json({ message: err.message });
    } finally {
        connection.release();
    }
});

router.get('/transactions', [verifyToken, isManajemen], async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT t.id, t.kode_transaksi, t.transaction_date, t.total_price, t.payment_method, e.name as cashier_name
            FROM transactions t
            JOIN employees e ON t.employee_id = e.id
            WHERE t.deleted_at IS NULL
            ORDER BY t.transaction_date DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- PURCHASE REQUESTS ---
router.post('/purchase-requests', [verifyToken, isManajemen], async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { supplier_id, items } = req.body;
        const createdBy = req.user.id;
        const kode = await CodeGenerator.generatePurchaseRequestCode();

        const [prResult] = await connection.query(
            'INSERT INTO purchase_requests (kode_permintaan, supplier_id, created_by) VALUES (?, ?, ?)',
            [kode, supplier_id, createdBy]
        );
        const requestId = prResult.insertId;

        for (const item of items) {
            await connection.query(
                'INSERT INTO purchase_request_items (request_id, item_id, quantity_requested) VALUES (?, ?, ?)',
                [requestId, item.item_id, item.quantity_requested]
            );
        }

        await connection.commit();

        await logAudit('CREATE', 'purchase_requests', requestId, req.user.id, null, { kode_permintaan: kode, supplier_id, items });
        res.status(201).json({ message: 'Purchase request created', requestId });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ message: err.message });
    } finally {
        connection.release();
    }
});

router.get('/purchase-requests', [verifyToken, isManajemen], async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT pr.id, pr.kode_permintaan, pr.request_date, pr.status, s.name as supplier_name, e.name as created_by_name
            FROM purchase_requests pr
            JOIN suppliers s ON pr.supplier_id = s.id
            JOIN employees e ON pr.created_by = e.id
            WHERE pr.deleted_at IS NULL
            ORDER BY pr.request_date DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/purchase-requests/:id/items', [verifyToken, isManajemen], async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT pri.id, pri.item_id, pri.quantity_requested, i.kode_barang, i.name,
                COALESCE((
                    SELECT SUM(gii.quantity_received) 
                    FROM goods_inward_items gii 
                    JOIN goods_inward gi ON gii.goods_inward_id = gi.id 
                    WHERE gi.request_id = ? AND gii.item_id = pri.item_id AND gi.deleted_at IS NULL
                ), 0) as quantity_received_total
            FROM purchase_request_items pri
            JOIN items i ON pri.item_id = i.id
            WHERE pri.request_id = ? AND pri.deleted_at IS NULL
        `, [req.params.id, req.params.id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/purchase-requests/pending', [verifyToken, isManajemen], async (req, res) => {
    try {
        const [rows] = await db.query(`SELECT id, kode_permintaan FROM purchase_requests WHERE status IN ('pending', 'partial') AND deleted_at IS NULL`);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- GOODS INWARD ---
router.post('/goods-inward', [verifyToken, isManajemen], async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { invoice_number, request_id, items } = req.body;

        const [prCheck] = await connection.query('SELECT status FROM purchase_requests WHERE id = ?', [request_id]);
        if (!prCheck.length) throw new Error('Purchase Request tidak ditemukan.');
        if (prCheck[0].status === 'completed') throw new Error('Duplikasi: Purchase Request ini sudah diselesaikan seluruhnya.');

        const [requestedItems] = await connection.query('SELECT item_id, quantity_requested FROM purchase_request_items WHERE request_id = ?', [request_id]);

        const [receivedItems] = await connection.query(`
            SELECT gii.item_id, SUM(gii.quantity_received) as total_recv
            FROM goods_inward_items gii
            JOIN goods_inward gi ON gi.id = gii.goods_inward_id
            WHERE gi.request_id = ? AND gi.deleted_at IS NULL
            GROUP BY gii.item_id
        `, [request_id]);

        for (const item of items) {
            if (item.quantity_received > 0) {
                const reqItem = requestedItems.find(r => r.item_id === item.item_id);
                if (!reqItem) throw new Error(`Barang ID ${item.item_id} tidak ada dalam PR ini.`);

                const alreadyRecv = Number(receivedItems.find(r => r.item_id === item.item_id)?.total_recv || 0);
                if ((alreadyRecv + Number(item.quantity_received)) > reqItem.quantity_requested) {
                    throw new Error(`Over-flow: Jumlah kedatangan barang ID ${item.item_id} melebihi permintaan (Sisa bisa diterima: ${reqItem.quantity_requested - alreadyRecv}).`);
                }
            }
        }

        const [giResult] = await connection.query(
            'INSERT INTO goods_inward (invoice_number, request_id, verified_by) VALUES (?, ?, ?)',
            [invoice_number, request_id, req.user.id]
        );
        const goodsInwardId = giResult.insertId;

        for (const item of items) {
            if (item.quantity_received > 0) {
                await connection.query(
                    'INSERT INTO goods_inward_items (goods_inward_id, item_id, quantity_received) VALUES (?, ?, ?)',
                    [goodsInwardId, item.item_id, item.quantity_received]
                );

                await connection.query(
                    'UPDATE items SET stock = stock + ? WHERE id = ?',
                    [item.quantity_received, item.item_id]
                );
            }
        }



        let allCompleted = true;
        // Phase 3 Logic: < requested = pending, == requested = completed
        for (const reqItem of requestedItems) {
            const [recv] = await connection.query(`
                SELECT SUM(gii.quantity_received) as total_recv
                FROM goods_inward_items gii
                JOIN goods_inward gi ON gi.id = gii.goods_inward_id
                WHERE gi.request_id = ? AND gii.item_id = ? AND gi.deleted_at IS NULL
            `, [request_id, reqItem.item_id]);

            const totalRecv = recv[0].total_recv || 0;
            if (totalRecv < reqItem.quantity_requested) {
                allCompleted = false;
            }
        }

        const newStatus = allCompleted ? 'completed' : 'partial';

        await connection.query(
            'UPDATE purchase_requests SET status = ? WHERE id = ?',
            [newStatus, request_id]
        );

        await connection.commit();
        await logAudit('CREATE', 'goods_inward', goodsInwardId, req.user.id, null, { invoice_number, request_id });

        res.status(201).json({ message: 'Goods received successfully', goodsInwardId, newStatus });
    } catch (err) {
        await connection.rollback();
        res.status(400).json({ message: err.message });
    } finally {
        connection.release();
    }
});

router.get('/goods-inward/history', [verifyToken, isManajemen], async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT gi.invoice_number, gi.received_date, pr.kode_permintaan, s.name as supplier_name,
                   i.name as item_name, gii.quantity_received, pri.quantity_requested
            FROM goods_inward gi
            JOIN goods_inward_items gii ON gi.id = gii.goods_inward_id
            JOIN purchase_requests pr ON gi.request_id = pr.id
            JOIN suppliers s ON pr.supplier_id = s.id
            JOIN items i ON gii.item_id = i.id
            JOIN purchase_request_items pri ON pr.id = pri.request_id AND i.id = pri.item_id
            WHERE gi.deleted_at IS NULL
            ORDER BY gi.received_date DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- REPORTS ---
router.get('/reports', [verifyToken, isManajemen], async (req, res) => {
    try {
        const { month, year } = req.query;
        let txQuery = `SELECT SUM(total_price) as total_sales, COUNT(id) as total_transactions FROM transactions WHERE deleted_at IS NULL`;
        let giQuery = `SELECT COUNT(id) as total_inwards FROM goods_inward WHERE deleted_at IS NULL`;
        const params = [];

        if (month && year) {
            txQuery += ` AND MONTH(transaction_date) = ? AND YEAR(transaction_date) = ?`;
            giQuery += ` AND MONTH(received_date) = ? AND YEAR(received_date) = ?`;
            params.push(month, year);
        }

        const [txStats] = await db.query(txQuery, params);
        const [giStats] = await db.query(giQuery, params);

        let trendQuery = `SELECT DATE_FORMAT(transaction_date, '%d %b') as date, SUM(total_price) as sales FROM transactions WHERE deleted_at IS NULL`;
        const trendParams = [];
        if (month && year) {
            trendQuery += ` AND MONTH(transaction_date) = ? AND YEAR(transaction_date) = ? GROUP BY DATE(transaction_date) ORDER BY DATE(transaction_date) ASC`;
            trendParams.push(month, year);
        } else {
            trendQuery += ` AND transaction_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) GROUP BY DATE(transaction_date) ORDER BY DATE(transaction_date) ASC`;
        }
        const [trendData] = await db.query(trendQuery, trendParams);

        res.json({ sales: txStats[0], inwards: giStats[0], trend: trendData });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/reports/sales/detail', [verifyToken, isManajemen], async (req, res) => {
    try {
        const { month, year } = req.query;
        let query = `
            SELECT t.kode_transaksi, DATE_FORMAT(t.transaction_date, '%Y-%m-%d %H:%i') as tanggal,
                    e.name as kasir, i.name as barang, ti.quantity_sold as qty, ti.price_per_unit as harga_satuan, 
                    (ti.quantity_sold * ti.price_per_unit) as subtotal, t.payment_method
            FROM transactions t
            JOIN transaction_items ti ON t.id = ti.transaction_id
            JOIN items i ON ti.item_id = i.id
            JOIN employees e ON t.employee_id = e.id
            WHERE t.deleted_at IS NULL
        `;
        const params = [];
        if (month && year) { query += ` AND MONTH(t.transaction_date) = ? AND YEAR(t.transaction_date) = ?`; params.push(month, year); }
        query += ` ORDER BY t.transaction_date DESC`;
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/reports/inwards/detail', [verifyToken, isManajemen], async (req, res) => {
    try {
        const { month, year } = req.query;
        let query = `
            SELECT gi.invoice_number, DATE_FORMAT(gi.received_date, '%Y-%m-%d %H:%i') as tanggal,
                    pr.kode_permintaan, s.name as supplier, e.name as penerima,
                    i.name as barang, gii.quantity_received as qty
            FROM goods_inward gi
            JOIN goods_inward_items gii ON gi.id = gii.goods_inward_id
            JOIN items i ON gii.item_id = i.id
            JOIN purchase_requests pr ON gi.request_id = pr.id
            JOIN suppliers s ON pr.supplier_id = s.id
            JOIN employees e ON gi.verified_by = e.id
            WHERE gi.deleted_at IS NULL
        `;
        const params = [];
        if (month && year) { query += ` AND MONTH(gi.received_date) = ? AND YEAR(gi.received_date) = ?`; params.push(month, year); }
        query += ` ORDER BY gi.received_date DESC`;
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- AUDIT LOGS (DISTRIBUTED) ---
router.get('/audit-logs/:tableName', [verifyToken, isManajemen], async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT a.id, a.action, a.table_name, a.record_id, a.old_data, a.new_data, 
                    DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i:%s') as waktu, e.name as pelaksana
            FROM audit_logs a
            LEFT JOIN employees e ON a.user_id = e.id
            WHERE a.table_name = ?
            ORDER BY a.created_at DESC LIMIT 50
        `, [req.params.tableName]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
