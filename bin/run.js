const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const debug = require('debug')('main');
const axios = require('axios');
const { spawn } = require('child_process');
const testcases = require('./testcases');
const urlJoin = require('url-join');
const parseWrk = require('./parse-wrk');
const parseDockerStats = require('./parse-docker-stats');

const DEFAULT_CONTAINER_NAME = 'perftest';
const BASE_PORT = 3000;

let BASE_DIR = process.env.BASE_DIR || path.join(__dirname, '..');
let WRK_OUTFILE = process.env.WRK_OUTFILE || path.join(BASE_DIR, 'wrk_output.json');

function listFolders(dir) {
    const content = fs.readdirSync(dir, { withFileTypes: true });
    return content.filter(d => d.isDirectory()).map(d => d.name);
}

function readJson(filepath, defaultVal) {
    try {
        return JSON.parse(fs.readFileSync(filepath).toString());
    } catch (ex) {
        return defaultVal;
    }
}

function writeJson(filepath, val) {
    fs.writeFileSync(filepath, JSON.stringify(val, null, 4));
}

function augmentTestCase(name, index) {
    debug(`augmentTestCase(${name}):`);

    const dockerFilePath = path.join(BASE_DIR, name, 'Dockerfile');
    debug(`dockerfilePath=${dockerFilePath}`);

    let fileContents = '';
    try {
        fileContents = fs.readFileSync(dockerFilePath).toString();
    } catch (ex) {
        console.error(chalk.red(`Error: cannot read dockerfile for ${name}: ${ex}`));
        return null;
    }

    let expose = fileContents.match(/EXPOSE\s+([0-9]{2,5})/);
    if (!expose) {
        console.error(chalk.red(`Error: missing EXPOSE statement in: ${dockerFilePath}, assuming 8080`));
        expose = [
            '8080',
            '8080'
        ];
    }

    const port = Number(expose[1]);
    if (port < 1 || port > 65535) {
        console.error(chalk.red(`Error: EXPOSE port out of range in: ${dockerFilePath} (read: ${port})`));
        return null;
    }

    return {
        exposePort: port,
        externalPort: BASE_PORT + index,
        name,
        dockerImageName: [
            `perf${name}`,
            'latest'
        ],
        dirPath: path.join(BASE_DIR, name),
        dockerFilePath,
        containerName: `${DEFAULT_CONTAINER_NAME}-${name}`
    }
}

async function system(cmd, args, opts) {
    debug(`system(${cmd}, ${args}, ${opts})`);

    const proc = spawn(cmd, args || [], {
        cwd: opts && opts.cwd || process.cwd(),
        ...(opts && opts.env ? { env: { ...process.env, ...opts.env } } : {})
    });

    let allBuf = '';

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





async function isDockerImageExisting(testInfo) {
    const imageName = testInfo.dockerImageName[0];
    debug(`isDockerImageExisting(${testInfo.name}), imageName=${imageName}`);

    const retval = await system(
        'docker',
        [
            'images',
            imageName,
            '--format',
            '{{.ID}};{{.Repository}};{{.Size}}'
        ]
    );

    if (retval.code != 0) {
        console.error(chalk.red(`Error: cannot read from docker:`));
        console.error(chalk.red(retval.out));
        throw new Error(`Cannot read from docker if image exists`)
    }

    for (let line of retval.out.split('\n')) {
        debug(`isDockerImageExisting() parse: ${line}`);

        const parts = line.trim().split(';');
        if (parts.length != 3) {
            debug(`Not enough arguments in line`);
            continue;
        }
        
        if (testInfo.dockerImageName[0] != parts[1]) {
            debug(`Image names are not matching: ${testInfo.dockerImageName[0]} vs. ${parts[1]}`)
            continue;
        }
    
        testInfo.imageId = parts[0];
        testInfo.imageSize = parts[2];

        return true;
    }

    return false;
}

async function buildDockerImage(testInfo) {
    const imageName = testInfo.dockerImageName.join(':');

    debug(`buildDockerImage(${testInfo.name})`);
    console.log(chalk.green(`--> Building docker image: ${imageName}`));

    const retval = await system(
        'docker',
        [
            'build',
            '-t',
            imageName,
            '.'
        ],
        {
            cwd: testInfo.dirPath,
            stdout: (chunk) => {
                process.stdout.write(chalk.gray(chunk));
            }
        }
    );

    if (retval.code != 0) {
        console.error(chalk.red(`Error: cannot build docker image:`));
        console.error(chalk.red(retval.out));
        throw new Error(`Cannot build docker image for ${testInfo.name}`);
    }


    if (!(await isDockerImageExisting(testInfo))) {
        console.error(chalk.red(`Error: image not existing: ${testInfo.name}`));
        throw new Error(`Failed to build the docker image: not existing after build!`);
    }

    console.log(`\nReport\n---`);
    console.log(`Image name ...: ${imageName}`);
    console.log(`Image size ...: ${testInfo.imageSize}`);
    console.log(`Image id .....: ${testInfo.imageId}`);
    console.log(``);
}

async function startContainer(testInfo) {
    const imageName = testInfo.dockerImageName.join(':');
    debug(`startContainer(${testInfo.name})`);
    console.log(chalk.green(`--> Starting docker image: ${imageName}`));

    debug(`containerName=${testInfo.containerName}`);

    const args = [
        'run',
        '--rm',
        '-d',
        `--name`, testInfo.containerName,
        '-p', `${testInfo.externalPort}:${testInfo.exposePort}`,
        imageName,
    ];

    let retries = 0;
    let retval = {};
    main_loop: do {
        retval = await system(
            'docker',
            args,
        );
        retries++;

        if (retval.code === 0) {
            break; // Success
        }
    
        if (retval.code != 0) {
            debug(`Failed to start container! Reason:`, retval.out);

            if (retval.out.indexOf('is already in use by container') && retries < 3) {
                console.log(chalk.gray(`Container already presend, trying to kill ...`));

                const containerIdMatch = retval.out.match(/container\s+\"([0-9a-fA-F]+)\"/ )
                if (!containerIdMatch) {
                    console.log(chalk.red(`Error: cannot extract container id`));
                } else {
                    const containerId = containerIdMatch[1];
                    console.log(chalk.gray(`Killing ${containerId} ...`));

                    if ((await killContainerById(containerId))) {
                        console.log(chalk.gray(`Success! Retry ...`));
                        continue main_loop;
                    } else {
                        console.log(chalk.red(`Panic: cannot kill container`));
                    }
                    
                }
            }

            console.error(chalk.red(`Error: cannot start new container:`));
            console.error(chalk.red(` (args: ${args.join(' ')})`));
            console.error(chalk.red(retval.out));
            throw new Error(`Failed to start container ${imageName}`);
        }
    } while(true);

    debug(`startContainer():`, retval.out);

    const potentialContainerId = retval.out.trim();

    if (!potentialContainerId.match(/^[0-9a-fA-F]{64}$/)) {
        console.error(chalk.red(`Error: response from docker is no container id:`));
        console.error(chalk.red(potentialContainerId));
        throw new Error(`Response from docker is no container id`);
    }

    testInfo.containerId = potentialContainerId;

    console.log(chalk.gray(`Container running at: ${testInfo.containerId}`));
}

async function killContainerById(containerId) {
    debug(`killContainerById(${containerId})`);

    const retval = await system(
        'docker',
        [
            'kill',
            containerId
        ]
    );

    if (retval.code !== 0) {
        console.error(chalk.red(`Error: failed to kill container #${containerId}!`));
        return false;
    }

    debug(`Waiting for container to be killed ...`);
    for (let i = 0; i < 100; i++) {
        await (new Promise((res, _) => setTimeout(res, 500)));

        const retval = await system('docker', [ 'ps' ]);
        const n = (retval.out || '').split('\n').filter(ln => (ln.indexOf(containerId.substring(0, 8)) > -1)).length;

        if (n < 1) {
            break;
        }

        debug(`${n} - container still running!`);
        await (new Promise((res, _) => setTimeout(res, 500)));
    }

    await (new Promise((res, _) => setTimeout(res, 5000)));

    return retval.code === 0;
}

async function waitForContainerStartup(testInfo) {
    debug(`waitForContainerStartup(${testInfo.name})`);
    const url = `http://localhost:${testInfo.externalPort}/index.html`;

    let connected = false;
    for (let i = 0; i < 42; i++) {
        await (new Promise((res, _) => setTimeout(res, 1000)));

        try {
            const resp = await axios.get(url);
            if (resp.status === 200) {
                debug(`Connected, HTTP 200 (${i})`);
                connected = true;
                break;
            } else {
                debug(`Error: HTTP ${resp.status} from ${url} (${i})`);
            }

        } catch (ex) {
            debug(`Error: (${i}) failed to connect to: ${url}`);
            debug(ex);
        }
    }

    if (!connected) {
        debug(`Error: failed to connect after many attempts`);
        return false;
    }

    console.log(chalk.green(`--> Container up and running and reachable via ${url}`));

    await (new Promise((res, _) => setTimeout(res, 5000)));

    return true;
}

async function stopContainer(testInfo) {
    return await killContainerById(testInfo.containerId);
}

async function checkIfTestcaseIsCompliant(testInfo) {
    debug(`checkIfTestcaseIsCompliant(${testInfo.name})`);
    console.log(chalk.green(`--> Testing service if compliant ...`));

    // Start the container
    await startContainer(testInfo);

    await waitForContainerStartup(testInfo);

    const ret = await system(
        'npm',
        [
            'run',
            'test'
        ],
        {
            env: {
                BASE_URL: `http://localhost:${testInfo.externalPort}`,
                EXPECTED_SERVICE_NAME: testInfo.name
            }
        }
    );

    await stopContainer(testInfo);

    if (ret.code != 0) {
        console.error(chalk.red(`Error: service failed service test!`));
        console.error(chalk.red(ret.out));
        throw new Error(`Service cannot be tested for compliance to test requirements!`);
    }
    
    console.log(chalk.green(`--> Service OK`));
}

async function runWrk(testInfo, testcase) {
    debug(`runWrk():`, testcase);

    const url = urlJoin(
        `http://localhost:${testInfo.externalPort}`,
        testcase.urlPrefix
    );

    console.log(chalk.green(`--> Performing test against: ${url}`));
    console.log(chalk.green(`    c=${testcase.c}, t=${testcase.t}, d=${testcase.d}, name=${testcase.name}`));

    let isRunning = true;

    const [retval, memVals] = await Promise.all([
        (new Promise(async (res) => {

            // Run wrk
            const retval = await system(
                process.env.WRK_BIN || 'wrk',
                [
                    '-s', path.join(BASE_DIR, 'bin', 'report.lua'),
                    `-c${testcase.c}`,
                    `-d${testcase.d}`,
                    `-t${testcase.t}`,
                    url
                ]
            );

            isRunning = false;
            res(retval);
    
        })),
        (new Promise(async (res) => {

            let buffer = '';

            while (isRunning) {
                const ret = await system(
                    'docker',
                    [
                        'stats',
                        '--no-stream',
                        '--format', '{{.Name}} {{.CPUPerc}} {{.MemUsage}}'
                    ]
                );

                if (ret.code != 0) {
                    console.error(chalk.red(`Error: failed to get memory values from docker:`));
                    console.error(chalk.red(ret.out));
                    continue;
                }

                const lines = (ret.out || '').split('\n').filter(ln => ln.indexOf(testInfo.containerName) > -1);
    
                if (lines.length > 0) {
                    buffer += lines[0] + '\n';
                }
    
                await (new Promise((res, _) => setTimeout(res, 250)));
            }
    
            try {
                res(parseDockerStats(buffer));
            } catch (ex) {
                res({});
                console.error(chalk.red(`Error: failed to parse memory values from docker:`));
                console.error(chalk.red(ex));
            }
    
        }))
    ]);

    if (retval.code != 0) {
        console.error(chalk.red(`Error: wrk failed to check endpoint!`));
        console.error(chalk.red(retval.out));
        throw new Error(`Failed to check endpoint!`);
    }

    const results = parseWrk(retval.out);
    if (!results || Object.keys(results) < 4) {
        console.error(chalk.red(`Error: failed to parse wrk output!`));
        console.error(chalk.red(results));
        throw new Error(`Cannot parse wrk output!`);
    }

    isRunning = false;

    results.testcase = testcase.name;
    results.name = testInfo.name;
    results.resources = memVals;


    const data = readJson(WRK_OUTFILE, []);
    data.push(results);
    writeJson(WRK_OUTFILE, data);
    
    console.log(chalk.green(`--> Test done!`));
}

// ---

async function main() {
    const statistics = {
        failedPreflightTestsCount: 0,
        failedPreflightTests: [],
        failedContainerStartBeforeTest: 0,
        failedAwaitContainerReady: 0,
        failedWrkTest: 0,
        failedStopContainer: 0
    };

    // console.log(listFolders(BASE_DIR).filter(d => d.startsWith('test-')));

    const availableTests = [
        // 'test-openresty'
        'test-go-mux'
    ].map(augmentTestCase).filter(t => !!t);

    console.log(chalk.green(`--> Found ${availableTests.length} test(s) to execute`));

    // Run the tests
    // ---
    const totalTests = availableTests.length * testcases.length;
    let doneTests = 0;
    for (let test of availableTests) {
        debug(`Starting test:`, test);
        console.log(chalk.blue(`---\n Test: ${test.name}\n---`));

        // Build the image if not yet exists
        if (process.env.REBUILD_IMAGES === '1' || !(await isDockerImageExisting(test))) {
            console.log(chalk.gray(`Docker image not found, build required!`));

            await buildDockerImage(test);
        } else {
            console.log(chalk.gray(`Docker image already built!`));
        }

        // Check if the API is compliant to the requirements
        try {
            await checkIfTestcaseIsCompliant(test);
        } catch (ex) {
            statistics.failedPreflightTestsCount++;
            statistics.failedPreflightTests.push(test.name);

            console.log(chalk.red(`Error: preflight tests for ${test.name} failed!`));
            console.log(chalk.red(ex));

            continue; // Stop here
        }

        // Execute all testcases for the current test
        for (let testcase of testcases) {
            doneTests++;
            console.log(chalk.blue(`${doneTests}/${totalTests} - ${Math.round((doneTests/totalTests)*100)}%`))

            // Start the container
            try {
                await startContainer(test);
            } catch (ex) {
                statistics.failedContainerStartBeforeTest++;
    
                console.log(chalk.red(`Error: failed to start container for ${test.name}!`));
                console.log(chalk.red(ex));
    
                continue; // Stop here
            }

            // Wait until the container is ready
            try {
                if (!(await waitForContainerStartup(test))) {
                    throw new Error(`Await timeout!`)
                }
            } catch (ex) {
                statistics.failedAwaitContainerReady++;
    
                console.log(chalk.red(`Error: timeout waiting for container ${test.name}!`));
                console.log(chalk.red(ex));
    
                continue; // Stop here
            }

            // Perform the actual test
            try {
                await runWrk(test, testcase);
            } catch (ex) {
                statistics.failedWrkTest++;
    
                console.log(chalk.red(`Error: failed to perform test for ${test.name}!`));
                console.log(chalk.red(ex));
    
                continue; // Stop here
            }

            // Perform the actual test
            try {
                await stopContainer(test);
            } catch (ex) {
                statistics.failedStopContainer++;
    
                console.log(chalk.red(`Error: failed to stop container for ${test.name} (${test.containerId})!`));
                console.log(chalk.red(ex));
    
                continue; // Stop here
            }
            
        }

    }

    console.log(chalk.blue(`\n\n--- Report ---`));
    for (let key in statistics) {
        console.log(chalk.blue(` - ${key} ..: ${statistics[key]}`));
    }

    console.log(chalk.blue(`\n\nDone.`));
}

main().catch((ex) => { console.error(ex); process.exit(1); });