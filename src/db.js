import initSqlJs from 'sql.js'

// Database instance (singleton)
let db = null

/**
 * Initialize the in-memory SQLite database
 * Creates tables and seeds with dummy data
 */
export async function initDatabase() {
    if (db) return db

    // Initialize SQL.js with WASM
    const SQL = await initSqlJs({
        locateFile: (file) => `https://sql.js.org/dist/${file}`
    })

    // Create in-memory database
    db = new SQL.Database()

    // Create users table
    db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL CHECK(role IN ('admin', 'player')),
      coins INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 0
    )
  `)

    // Create scan_logs table
    db.run(`
    CREATE TABLE IF NOT EXISTS scan_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      result TEXT NOT NULL CHECK(result IN ('safe', 'fake', 'uncertain')),
      confidence REAL NOT NULL CHECK(confidence >= 0 AND confidence <= 100),
      reason TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)

    // Create admin_alerts table for real-time notifications
    db.run(`
    CREATE TABLE IF NOT EXISTS admin_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      username TEXT NOT NULL,
      scan_log_id INTEGER NOT NULL,
      reason TEXT,
      confidence REAL,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      acknowledged INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (scan_log_id) REFERENCES scan_logs(id)
    )
  `)

    // Seed dummy data
    seedDatabase()

    return db
}

/**
 * Seed the database with initial dummy data
 */
function seedDatabase() {
    // Insert admin user
    db.run(`
    INSERT INTO users (username, role, coins, streak)
    VALUES ('admin', 'admin', 1000, 0)
  `)

    // Insert player user (Grandma)
    db.run(`
    INSERT INTO users (username, role, coins, streak)
    VALUES ('Grandma', 'player', 250, 5)
  `)

    // Insert 5 scan logs for Grandma (user_id = 2)
    // Seed scan logs pushed back 7+ days so real scans appear first
    const scanLogs = [
        { result: 'safe', confidence: 95.5, reason: 'No manipulation detected', daysAgo: 7 },
        { result: 'fake', confidence: 87.2, reason: 'Face swap artifacts detected', daysAgo: 8 },
        { result: 'safe', confidence: 99.1, reason: 'Original media verified', daysAgo: 10 },
        { result: 'uncertain', confidence: 52.3, reason: 'Low quality source material', daysAgo: 12 },
        { result: 'safe', confidence: 91.8, reason: 'No audio manipulation detected', daysAgo: 14 },
    ]

    scanLogs.forEach((log) => {
        const timestamp = new Date(Date.now() - log.daysAgo * 24 * 60 * 60 * 1000).toISOString()
        db.run(
            `INSERT INTO scan_logs (user_id, timestamp, result, confidence, reason)
       VALUES (2, ?, ?, ?, ?)`,
            [timestamp, log.result, log.confidence, log.reason]
        )
    })
}

/**
 * Get the database instance
 * @returns {Database} The SQLite database instance
 */
export function getDatabase() {
    if (!db) {
        throw new Error('Database not initialized. Call initDatabase() first.')
    }
    return db
}

/**
 * Execute a SELECT query and return results as an array of objects
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Array} Array of row objects
 */
export function queryAll(sql, params = []) {
    const stmt = db.prepare(sql)
    stmt.bind(params)

    const results = []
    while (stmt.step()) {
        results.push(stmt.getAsObject())
    }
    stmt.free()

    return results
}

/**
 * Execute a SELECT query and return the first result
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Object|null} First row object or null
 */
export function queryOne(sql, params = []) {
    const results = queryAll(sql, params)
    return results.length > 0 ? results[0] : null
}

/**
 * Execute a non-SELECT query (INSERT, UPDATE, DELETE)
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Object} Object with changes count and lastInsertRowid
 */
export function execute(sql, params = []) {
    db.run(sql, params)
    return {
        changes: db.getRowsModified(),
        lastInsertRowid: queryOne('SELECT last_insert_rowid() as id')?.id
    }
}

/**
 * Get all users
 * @returns {Array} Array of user objects
 */
export function getAllUsers() {
    return queryAll('SELECT * FROM users ORDER BY id')
}

/**
 * Get user by ID
 * @param {number} id - User ID
 * @returns {Object|null} User object or null
 */
export function getUserById(id) {
    return queryOne('SELECT * FROM users WHERE id = ?', [id])
}

/**
 * Get scan logs for a user
 * @param {number} userId - User ID
 * @returns {Array} Array of scan log objects
 */
export function getScanLogsByUser(userId) {
    return queryAll(
        'SELECT * FROM scan_logs WHERE user_id = ? ORDER BY timestamp DESC',
        [userId]
    )
}

/**
 * Add a new scan log
 * @param {Object} log - Scan log data
 * @returns {Object} Insert result with lastInsertRowid
 */
export function addScanLog({ userId, result, confidence, reason }) {
    return execute(
        `INSERT INTO scan_logs (user_id, result, confidence, reason)
     VALUES (?, ?, ?, ?)`,
        [userId, result, confidence, reason]
    )
}

/**
 * Update user coins
 * @param {number} userId - User ID
 * @param {number} amount - Amount to add (can be negative)
 * @returns {Object} Update result
 */
export function updateUserCoins(userId, amount) {
    return execute(
        'UPDATE users SET coins = coins + ? WHERE id = ?',
        [amount, userId]
    )
}

/**
 * Update user streak
 * @param {number} userId - User ID
 * @param {number} streak - New streak value
 * @returns {Object} Update result
 */
export function updateUserStreak(userId, streak) {
    return execute(
        'UPDATE users SET streak = ? WHERE id = ?',
        [streak, userId]
    )
}

/**
 * Create an admin alert when a deepfake is detected
 * @param {Object} data - Alert data
 * @returns {Object} Insert result
 */
export function createAdminAlert({ userId, username, scanLogId, reason, confidence }) {
    return execute(
        `INSERT INTO admin_alerts (user_id, username, scan_log_id, reason, confidence)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, username, scanLogId, reason, confidence]
    )
}

/**
 * Get unacknowledged alerts for admin
 * @returns {Array} Array of unacknowledged alerts
 */
export function getUnacknowledgedAlerts() {
    return queryAll(
        `SELECT * FROM admin_alerts WHERE acknowledged = 0 ORDER BY timestamp DESC`
    )
}

/**
 * Acknowledge an alert
 * @param {number} alertId - Alert ID
 * @returns {Object} Update result
 */
export function acknowledgeAlert(alertId) {
    return execute(
        'UPDATE admin_alerts SET acknowledged = 1 WHERE id = ?',
        [alertId]
    )
}

/**
 * Acknowledge all alerts
 * @returns {Object} Update result
 */
export function acknowledgeAllAlerts() {
    return execute('UPDATE admin_alerts SET acknowledged = 1')
}
