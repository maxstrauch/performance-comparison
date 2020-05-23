const { importIntoDatabase } = require('./dataloader');
const program = require('commander');
const path = require('path');
const fs = require('fs-extra');
const { mysqlConnect, mysqlClose, mysqlQuery } = require('./util');
const chalk = require('chalk');
const { spawn } = require('child_process');

program
  .version('1.0')
  .option('-f, --file <file>', 'Path to the JSON file, containing raw test results')

program.parse(process.argv);

const REPORTS = [
    {
        name: 'Requests per sec, for selected connection counts (simplified)',
        path: './reports/req-per-sec_selected-conncounts.report.js'
    },
    {
        name: 'Requests per sec, for all connection counts (overview)',
        path: './reports/req-per-sec_all.report.js'
    },
    {
        name: 'Requests per sec average over all',
        path: './reports/req-per-sec.report.js'
    },
    {
        name: 'Maximum used memory',
        path: './reports/mem-max_selected-conncounts.report.js'
    },
    {
        name: 'Average memory over all',
        path: './reports/mem-avg.report.js'
    },
    {
        name: 'Latency for requests for different conn counts',
        path: './reports/latency_selected-conncounts.report.js',
    },
    {
        name: 'Latency avarage over all',
        path: './reports/latency.report.js'
    },
    {
        name: 'CPU usage for different connection counts',
        path: './reports/cpu-conncounts.report.js',
    },
    {
        name: 'CPU usage over all',
        path: './reports/cpu.report.js',
    },
];

async function system(cmd, args, opts) {
    const proc = spawn(cmd, args || [], {
        cwd: opts && opts.cwd || process.cwd(),
        ...(opts && opts.env ? { env: { ...process.env, ...opts.env } } : {})
    });

    let allBuf = '';

    if (opts.stdin) {
        proc.stdin.write(opts.stdin);
        proc.stdin.end();
    }

    let stdoutBuf = '';
    proc.stdout.on('data', (data) => {
        stdoutBuf += data.toString();
        allBuf += data.toString();

        if (opts && opts.stdout) {
            opts.stdout(data.toString());
        }
    });

    let stderrBuf = '';
    proc.stderr.on('data', (data) => {
        stderrBuf += data.toString();
        allBuf += data.toString();

        if (opts && opts.stderr) {
            opts.stderr(data.toString());
        }
    });

    return new Promise((res, _) => {
        proc.on('close', (code) => {
            res({
                code,
                stdout: stdoutBuf,
                stderr: stderrBuf,
                out: allBuf
            });
        });
    });
}

function fileExists(file) {
    try {
        if (fs.existsSync(file)) {
            return true;
        }
    } catch(err) { }
    return false;
}

async function runReports(targetDir) {

    console.log(chalk.blue(`----`));
    console.log(chalk.blue(` Generate reports`));
    console.log(chalk.blue(`----`));

    console.log(chalk.green(`--> ${REPORTS.length} reports to generate to: ${targetDir}`));

    for (let report of REPORTS) {
        console.log(chalk.green(`--> ${report.name}`));

        const jsonChartSources = await require(report.path)();

        for (let chartSource of jsonChartSources) {
            let jsonTargetFile = path.join(targetDir, 'json');
            await fs.ensureDir(jsonTargetFile);
            jsonTargetFile = path.join(jsonTargetFile, chartSource.filename);

            fs.writeFileSync(
                jsonTargetFile, 
                JSON.stringify(chartSource.chartData, null, 4)
            );

            for (let outputFormat of ['png', 'pdf']) {
                let targetFile = path.join(targetDir, outputFormat);
                await fs.ensureDir(targetFile);
                targetFile = path.join(targetFile, chartSource.filename.substring(0, chartSource.filename.length - 5) + '.' + outputFormat);

                const ret = await system(
                    'node',
                    [
                        './charting/index.js',
                        '-c', jsonTargetFile,
                        '-o', targetFile,
                        '-d', '150'
                    ],
                    {
                        cwd: __dirname,
                    }
                );
    
                if (ret.code != 0) {
                    console.error(chalk.red(`Error: cannot render chart!`));
                    console.error(chalk.red(ret.out));
                }

            }
        }


    }

}

async function main() {

    console.log(chalk.gray(`                                                                    
    _____                 _      _____                     _           
   | __  |___ ___ ___ ___| |_   |   __|___ ___ ___ ___ ___| |_ ___ ___ 
   |    -| -_| . | . |  _|  _|  |  |  | -_|   | -_|  _| .'|  _| . |  _|
   |__|__|___|  _|___|_| |_|    |_____|___|_|_|___|_| |__,|_| |___|_|  
             |_|                                                       
    `));

    await mysqlConnect('mysql://root:@localhost/performance_tests');
    await mysqlQuery("SET sql_mode = ''");

    const absFile = path.resolve(program.file || '');

    if (!fileExists(absFile)) {
        console.error(`Error: missing datafile! Use -f and prodide a file!\n`);
        process.exit(1);
    }

    const baseDir = path.dirname(absFile);
    let fileName = path.basename(absFile);
    fileName = fileName.substring(0, fileName.length - path.extname(absFile).length);
    const outDir = path.join(baseDir, fileName);

    console.log(`${chalk.blue('Source file ....:')} ${absFile}`);
    console.log(`${chalk.blue('Base directory .:')} ${baseDir}`);
    console.log(`${chalk.blue('File name ......:')} ${fileName}`);
    console.log(`${chalk.blue('Out dir ........:')} ${outDir}`);
    console.log('');

    global.REPORT_TABLE_NAME = await importIntoDatabase(absFile, fileName);
    
    await fs.ensureDirSync(outDir);

    await runReports(outDir);

    await mysqlClose();

}

main().catch(err => { console.error(err); process.exit(1); });