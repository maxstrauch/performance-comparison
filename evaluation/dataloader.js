const fs = require('fs-extra');
const path = require('path');
const { mysqlQuery, mysqlInsert } = require('./util');
const chalk = require('chalk');
const moment = require('moment');

const importId = Math.random().toString(32).substring(2, 8);

const CREATE_TABLE_SQL = fs.readFileSync(path.join(__dirname, 'model.sql'))
    .toString()
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => !!stmt);

function flattenObject(obj) {
    const ret = {};
    const _flattenInternal = (prefix, root) => {
        for (let key of Object.keys(root)) {
            let newKey = `${prefix}_${key}`;
            if (newKey.startsWith('_')) {
                newKey = newKey.substring(1);
            }
            if (typeof root[key] === 'object') {
                _flattenInternal(newKey, root[key]);
            } else {
                ret[newKey] = root[key];
            }
        }
    }
    _flattenInternal('', obj);
    return ret;
}

async function importIntoDatabase(filePath, tableName) {
    const fullTableName = 'test-results_' + tableName;

    console.log(chalk.blue(`----`));
    console.log(chalk.blue(` Import data into database`));
    console.log(chalk.blue(`----`));

    // ---
    console.log(chalk.green(`--> Create table: ${tableName} ... `));

    const stmts = CREATE_TABLE_SQL.map(
        stmt => stmt.replace('`measurements`', '`' + fullTableName + '`')
    );

    for (let stmt of stmts) {
        await mysqlQuery(stmt);
    }

    // ---
    console.log(chalk.green(`--> Fetching data from: ${filePath} ...`));

    let jsonData = null;
    try {
        jsonData = JSON.parse(fs.readFileSync(filePath).toString());

        if (!Array.isArray(jsonData) || jsonData.length < 1) {
            throw new Error(`Result data file does not contain an array of result objects!`);
        }
    } catch (ex) {
        console.log(chalk.red(`Error: cannot load JSON data from file!`));
        console.log(chalk.red(ex));
        throw new Error(`cannot load JSON data from file!`);
    }

    console.log(chalk.gray(`Loaded ${jsonData.length} result objects`));

    // ---
    console.log(chalk.green(`--> Insert datasets into database ...`));

    process.stdout.write(`0/${jsonData.length}`);

    for (let i = 0; i < jsonData.length; i++) {
        const flatObject = flattenObject(jsonData[i]);

        await mysqlInsert(
            fullTableName,
            {
                ...flatObject,
                iat: moment(flatObject.iat).format("YYYY-MM-DD HH:mm:ss"),
                uid: importId,
            }
        );

        process.stdout.write(`\r${i+1}/${jsonData.length}`);
    }
    console.log();

    console.log(chalk.green(`--> Data loaded!`));
    return fullTableName;
}


module.exports = {
    importIntoDatabase: importIntoDatabase,
};