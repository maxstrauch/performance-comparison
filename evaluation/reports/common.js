const { mysqlQuery } = require('../util');

async function getTestcaseKeys() {
    const ret = await mysqlQuery(
        'SELECT DISTINCT testcase FROM `' + global.REPORT_TABLE_NAME + '`'
    );
    return ret.map(row => row.testcase);
}

function computStepSize(maxValue, requestedTicks) {
    const internalFn = (maxValue, requestedTicks) => {
        requestedTicks = requestedTicks || 10;

        const digits = `${Math.round(Math.abs(maxValue))}`.length;
        const nextBiggestFull = Math.pow(10, digits);

        if (maxValue < (nextBiggestFull/4)) {
            return Math.round((1/requestedTicks) * (nextBiggestFull/4));
        }

        if (maxValue < (nextBiggestFull/2)) {
            return Math.round((1/requestedTicks) * (nextBiggestFull/2));
        }

        return Math.round((1/requestedTicks) * nextBiggestFull);
    };

    console.log(`computStepSize(${maxValue}, ${requestedTicks}) = ${internalFn(maxValue, requestedTicks)}`);
    return internalFn(maxValue, requestedTicks);
}

function toMegaBytes(bytesCount) {
    return bytesCount / 1048576;
}

function formatMiBString(bytesCount) {
    return `${Math.round(toMegaBytes(bytesCount)*10)/10} MiB`;
}

module.exports = {
    getTestcaseKeys,
    computStepSize,
    toMegaBytes,
    formatMiBString
}