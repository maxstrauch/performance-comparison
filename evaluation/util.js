const mysql = require('mysql');

module.exports = {
    mysqlConnect: connect,
    mysqlQuery: query,
    mysqlInsert: insert,
    mysqlClose: close,
};

// --

let CONNECTION = null;

async function connect(databaseUrl) {
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection(databaseUrl);
        connection.connect((err) => {
            if (err) {
                reject(err);
                return;
            }
            CONNECTION = connection;
            resolve();
        });
    });
}

async function query(sql, args) {
    return new Promise((resolve, reject) => {
        try {
            CONNECTION.query(sql, args, (error, results, fields) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(results);
            });
        } catch(ex) {
            reject(ex);
        }
    });
}

async function insert(tableName, insertFields) {
    const keys = Object.getOwnPropertyNames(insertFields);

    if (keys.length < 1) {
        return null; // Nothing to do
    }

    const sqlStmt = 'INSERT INTO `' + tableName + '` (' +
        keys.map((key) => ('`' + key + '`')).join(', ') +
        ') VALUES (' +
        keys.map((_) => ('?')).join(', ') +
        ')';
    const sqlArgs = keys.map((key) => {

        const data = insertFields[key];

        if ((typeof data) === 'object' && data !== null) {
            return JSON.stringify(data, null, 0);
        } else {
            return data;
        }

    });
    const ret = await query(sqlStmt, sqlArgs);
    if (ret.affectedRows < 1) {
        throw new Error('Failed operation: creation of new entry!');
    }

    return `${ret.insertId || insertFields.id || null}`;
}

async function close() {
    CONNECTION.destroy();
}
