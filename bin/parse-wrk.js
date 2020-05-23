function parseWrkResult(str) {
    const result = {};

    try {
        const sepIdx = str.indexOf('---');
        str.substring(sepIdx + 4)
            .split('\n')
            .map(ln => ln.trim().split('='))
            .filter(part => Array.isArray(part) && part.length === 2 && !!part[0] && !!part[1])
            .map(part => ([ part[0].toLowerCase(), JSON.parse(part[1]) ]))
            .forEach(part => {
                result[part[0]] = part[1];
            });
            
        // Delete unwanted data
        delete result.summary.eod;
        delete result.summary.errors.eod;

        // Correct some data
        result.summary.duration = result.summary.duration / 1000000;

        // Add some calculated data
        result.summary.requests_per_sec = result.summary.requests / result.summary.duration;
        result.summary.transfer_per_sec = result.summary.bytes / result.summary.duration;
        
    } catch (ex) {
        console.error(`Error: cannot parse JSON data: ${ex}`);
        throw ex;
    }

    // Append some additional data
    try {
        const match = str.match(/([0-9]+).*?threads.*?and.*?([0-9]+).*?connections/);

        result.summary.threads = Number(match[1]);
        result.summary.connections = Number(match[2]);
    } catch (ex) {
        console.error(`WARN: cannot read threads and connection count!`);

        result.summary.threads = -1;
        result.summary.connections = -1;
    }

    result.iat = (new Date()).toISOString();

    return result;
}

module.exports = function(data) {
    try {
        const result = parseWrkResult(data);
        return result;
    } catch (ex) {
        throw new Error(`Error: cannot parse wrk output: ${ex}`);
    }
}