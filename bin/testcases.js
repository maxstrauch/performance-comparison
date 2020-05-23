module.exports = [];

const threads = process.env.WRK_THREADS || '4';
const connCounts = process.env.WRK_CONNS || '50 200 400 800';
const durs = process.env.WRK_DURS || '10s';
const cases = 'jwt-generate index-doc not-found rfc2616 rfc7523 file_rfc2616 file_rfc7523';

for (let conns of connCounts.split(' ')) {
    for (let dur of durs.split(' ')) {
        for (let testcase of cases.split(' ')) {
            module.exports.push({
                t: threads,
                c: conns,
                d: dur,
                urlPrefix: translateToUrlPostfix(testcase),
                name: testcase,
            });
        }
    }
}

function translateToUrlPostfix(name) {
    switch (name) {
        case 'jwt-generate':
            return 'json-generate';
        
        case 'index-doc':
            return 'index.html';

        case 'not-found':
            return 'thispagedoesnotexist.htmlext1';

        case 'rfc2616':
            return 'rfc2616.txt';

        case 'rfc7523':
            return 'rfc7523.txt';

        case 'file_rfc2616':
            return 'file_read_rfc2616.txt';

        case 'file_rfc7523':
            return 'file_read_rfc7523.txt';

        default:
            return null;
    }
}
