const db = require('../config/db');

async function getNextSequence(tableName, prefix, digitLength) {
    const [rows] = await db.query(
        `SELECT id FROM ${tableName} ORDER BY id DESC LIMIT 1`
    );
    let nextId = 1;
    if (rows.length > 0) {
        nextId = rows[0].id + 1;
    }
    return prefix + nextId.toString().padStart(digitLength, '0');
}

/**
 * Generates custom codes based on entity rules.
 */
const CodeGenerator = {
    async generateItemCode(name, merk) {
        const namePart = name ? name.replace(/\s+/g, '').padEnd(2, 'X').substring(0, 2).toUpperCase() : 'XX';
        const merkPart = merk ? merk.replace(/\s+/g, '').padEnd(3, 'X').substring(0, 3).toUpperCase() : 'XXX';
        const prefix = `${namePart}${merkPart}BRG`;
        return await getNextSequence('items', prefix, 3);
    },
    async generateEmployeeCode(role) {
        // [TAHUN_MASUK][ROLE][NO_URUT]
        // Example: 2024ADM001
        const year = new Date().getFullYear();
        const rolePrefix = role === 'manajemen' ? 'MJM' : 'KSR';
        return await getNextSequence('employees', `${year}${rolePrefix}`, 3);
    },
    async generateSupplierCode(name) {
        // SUP[SINGKATAN][NO_URUT]
        // Example: SUPJB001
        const words = name.split(' ');
        let singkatan = '';
        if (words.length > 1) {
            singkatan = (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
        } else {
            singkatan = name.substring(0, 2).toUpperCase();
        }
        return await getNextSequence('suppliers', `SUP${singkatan}`, 3);
    },
    async generateTransactionCode() {
        // TRX[YYYYMM][NO_URUT]
        const d = new Date();
        const yyyymm = `${d.getFullYear()}${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        return await getNextSequence('transactions', `TRX${yyyymm}`, 3);
    },
    async generatePurchaseRequestCode() {
        // PR[YYYYMM][NO_URUT]
        const d = new Date();
        const yyyymm = `${d.getFullYear()}${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        return await getNextSequence('purchase_requests', `PR${yyyymm}`, 3);
    }
};

module.exports = CodeGenerator;
