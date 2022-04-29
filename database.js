"use strict";
const Database = require('better-sqlite3');
const db = new Database('log.db')

const stmt = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name='accesslog';`);
let row = stmt.get();
// Check if there is a table. If row is undefined then no table exists.
if (row === undefined) {
// Echo information about what you are doing to the console.
    console.log('Your database appears to be empty. I will initialize it now.');
// Set a const that will contain your SQL commands to initialize the database.
    const sqlInit = `CREATE TABLE accesslog (id INTEGER PRIMARY KEY, remoteaddr TEXT,
      remoteuser TEXT,
      time TEXT,
      method TEXT,
      url TEXT,
      protocol TEXT,
      httpversion TEXT,
      status TEXT,
      referer TEXT,
      useragent TEXT);`
    // Execute SQL commands that we just wrote above.
    db.exec(sqlInit);
// Echo information about what we just did to the console.
    console.log('Your database has been initialized.');
} else {
// Since the database already exists, echo that to the console.
    console.log('Database exists.')
}
module.exports = db