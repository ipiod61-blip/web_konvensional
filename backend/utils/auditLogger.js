const db = require('../config/db');

/**
 * Logs an action to the audit_logs table.
 * @param {string} action - 'CREATE', 'UPDATE', 'DELETE'
 * @param {string} tableName - The name of the table being modified
 * @param {number} recordId - The ID of the record being modified
 * @param {number} userId - The ID of the user performing the action
 * @param {object} oldData - The previous state of the record (or null for CREATE)
 * @param {object} newData - The new state of the record (or null for DELETE)
 */
async function logAudit(action, tableName, recordId, userId, oldData, newData) {
    try {
        await db.query(
            'INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, action, tableName, recordId, oldData ? JSON.stringify(oldData) : null, newData ? JSON.stringify(newData) : null]
        );
    } catch (err) {
        console.error('Failed to write audit log:', err);
    }
}

module.exports = logAudit;
