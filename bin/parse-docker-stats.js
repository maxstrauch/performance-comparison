function getMultiplierByUnit(unit) {
    const stdUnit = unit.trim().toLowerCase();

    switch (stdUnit) {
        case 'kib':
        case 'kb':
            return 1024;

        case 'mib':
        case 'mb':
            return 1048576;

        case 'gib':
        case 'gb':
            return 1073741824;

        case 'tib':
        case 'tb':
            return 1099511627776;

        default:
            return 1;
    }
}

function computStats(data, key) {
    const ret = {
        min: data[0][key],
        max: data[0][key],
        avg: 0,
        stder: 0
    };

    for (let entry of data) {

        if (entry[key] < ret.min) {
            ret.min = entry[key];
        }

        if (entry[key] > ret.max) {
            ret.max = entry[key];
        }

        ret.avg += entry[key];
    }

    ret.avg = ret.avg / data.length;

    let stdDervSumTemp = 0;

    for (let entry of data) {
        stdDervSumTemp += (entry[key] - ret.avg) * (entry[key] - ret.avg);
    }

    ret.stder = Math.sqrt(stdDervSumTemp / data.length);

    return ret;
}

function parseDockerStats(data) {

    const parsedData = data
        .split('\n')
        .map(ln => ln.trim())
        .filter(ln => !!ln)
        .map(ln => {
            // ln := performance-test-container 0.00% 3.945MiB / 983.5MiB
            const firstSpace = ln.indexOf(' ');
            if (firstSpace < 1) {
                return null;
            }

            const secondSpace = ln.indexOf(' ', firstSpace + 1);
            if (secondSpace <= firstSpace) {
                return null;
            }

            const cpuPerc = ln.substring(firstSpace, secondSpace).trim().replace(/[^0-9\.]/g, '');

            const memStr = ln
                .substring(secondSpace)
                .trim()
                .split('/')
                .map(entry => {
                    const memMatch = entry.trim().match(/^([0-9\.]+)(.*?)$/);
                    if (!memMatch) {
                        return null;
                    }

                    return Math.round(Number(memMatch[1])*getMultiplierByUnit(memMatch[2]));
                });

            if (memStr.length != 2) {
                return null;
            }

            return {
                cpu: Number(cpuPerc),
                mem: memStr[0],
                memTotal: memStr[1]
            };
        })
        .filter(val => val !== null);
        
    // Calculate ...
    const cpu = computStats(parsedData, 'cpu');
    const mem = computStats(parsedData, 'mem');

    return {
        cpu,
        mem,
        totalMemoryBytes: parsedData[0].memTotal
    }
}

module.exports = function(stdinBuffer) {
    try {
        const result = parseDockerStats(stdinBuffer);
        return result;
    } catch (ex) {
        console.error(`Error: cannot parse docker stats output: ${ex}`);
        throw ex;
    }
}

