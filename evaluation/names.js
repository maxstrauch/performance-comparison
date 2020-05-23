function technologyKeyToBaseColor(technologyKey) {
    // For colors, see: https://www.materialpalette.com/colors
    switch (technologyKey) {
        case 'test-aspnet-core':
            return 'rgb(33, 150, 243)'; // Blue

        case 'test-dotnetcore-nancy':
            return 'rgb(0, 188, 212)'; // Cyan

        case 'test-go-mux':
            return 'rgb(96, 125, 139)'; // Blue gray

        case 'test-node-express':
            return 'rgb(0, 150, 136)'; // Teal

        case 'test-node-fastify':
            return 'rgb(76, 175, 80)'; // Green

        case 'test-node-nest':
            return 'rgb(205, 220, 57)'; // Lime

        case 'test-node-nestfastify':
            return 'rgb(255, 235, 59)'; // Yellow

        case 'test-node-plain':
            return 'rgb(255, 193, 7)'; // Amber

        case 'test-node-tsed':
            return 'rgb(255, 87, 34)'; // Deep orange

        case 'test-openresty':
            return 'rgb(63, 81, 181)'; // Indigo

        case 'test-php-fpm-nginx':
            return 'rgb(121, 85, 72)'; // Brown

        case 'test-python-flask':
            return 'rgb(158, 158, 158)'; // Brown

        case 'test-springboot':
            return 'rgb(156, 39, 176)'; // Purple

        case 'test-tomcat-plain':
            return 'rgb(103, 58, 183)'; // Depp purple

        default:
            throw new Error(`Unknown techonlogy key: ${technologyKey}`)
    }
}

function technologyKeyToCaption(technologyKey) {
    switch (technologyKey) {
        case 'test-aspnet-core':
            return 'ASP.NET Core';

        case 'test-dotnetcore-nancy':
            return '.NET Core Nancy';

        case 'test-go-mux':
            return 'Go';

        case 'test-node-express':
            return 'NodeJS Express';

        case 'test-node-fastify':
            return 'NodeJS Fastify';

        case 'test-node-nest':
            return 'NodeJS NestJS (Express)';

        case 'test-node-nestfastify':
            return 'NodeJS NestJS (Fastify)';

        case 'test-node-plain':
            return 'NodeJS plain server';

        case 'test-node-tsed':
            return 'NodeJS Ts.ED';

        case 'test-openresty':
            return 'Nginx OpenResty';

        case 'test-php-fpm-nginx':
            return 'Nginx PHP';

        case 'test-python-flask':
            return 'Python Flask';

        case 'test-springboot':
            return 'Java Spring Boot';

        case 'test-tomcat-plain':
            return 'Java Tomcat plain';

        default:
            throw new Error(`Unknown techonlogy key: ${technologyKey}`)
    }
}


function testcaseKeyToCaption(testcaseKey) {
    switch (testcaseKey) {
        case 'jwt-generate':
            return 'Generation of a dynamic JWT token';

        case 'index-doc':
            return 'Fetch string from memory';

        case 'not-found':
            return 'Request a non-existing url';

        case 'rfc2616':
            return 'Fetch big document (~420KiB) using static serve';

        case 'rfc7523':
            return 'Fetch small document (~26KiB) using static serve';

        case 'file_rfc2616':
            return 'Fetch big document (~420KiB) using explicit file read';

        case 'file_rfc7523':
            return 'Fetch small document (~26KiB) using explicit file read';

        default:
            throw new Error(`Unkown testcase ${testcaseKey} to stringify`);
    }
}

module.exports = {
    testcaseKeyToCaption,
    technologyKeyToCaption,
    technologyKeyToBaseColor
};