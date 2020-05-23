const supertest = require('supertest');
const fs = require('fs');

const RFC_2616_DOC = fs.readFileSync('./test/rfc2616.txt').toString();
const RFC_7523_DOC = fs.readFileSync('./test/rfc7523.txt').toString();

const INDEX_HTML = '<html><head><title></title></head><body><h1>It works!</h1></body></html>';

const app = process.env.BASE_URL || 'http://localhost:8080'

// ---

test('Correct file sizes for static files', () => {
    expect(RFC_2616_DOC.length).toBe(422279);
    expect(RFC_7523_DOC.length).toBe(26459);
})

test('Fetch /rfc2616.txt file', async () => {

    const retval = await supertest(app)
        .get('/rfc2616.txt')
        .expect(200);

    if (retval.text) {
        expect(retval.text).toBeDefined();
        expect(retval.text.length).toBeGreaterThanOrEqual(RFC_2616_DOC.length - 100);
        expect(retval.text.length).toBeLessThan(RFC_2616_DOC.length + 100);
    } else {
        expect(retval.body).toBeDefined();
        expect(retval.body.length).toBeGreaterThanOrEqual(RFC_2616_DOC.length - 100);
        expect(retval.body.length).toBeLessThan(RFC_2616_DOC.length + 100);
    }
});

test('Fetch /rfc7523.txt file', async () => {

    const retval = await supertest(app)
        .get('/rfc7523.txt')
        .expect(200);

    if (retval.text) {
        expect(retval.text).toBeDefined();
        expect(retval.text.length).toBeGreaterThanOrEqual(RFC_7523_DOC.length - 100);
        expect(retval.text.length).toBeLessThan(RFC_7523_DOC.length + 100);
    } else {
        expect(retval.body).toBeDefined();
        expect(retval.body.length).toBeGreaterThanOrEqual(RFC_7523_DOC.length - 100);
        expect(retval.body.length).toBeLessThan(RFC_7523_DOC.length + 100);
    }
});

test('Fetch /file_read_rfc2616.txt file', async () => {

    const retval = await supertest(app)
        .get('/file_read_rfc2616.txt')
        .expect(200);

    expect(retval.text).toBeDefined();
    expect(retval.text.length).toBeGreaterThanOrEqual(RFC_2616_DOC.length - 100);
    expect(retval.text.length).toBeLessThan(RFC_2616_DOC.length + 100);
});

test('Fetch /file_read_rfc7523.txt file', async () => {

    const retval = await supertest(app)
        .get('/file_read_rfc7523.txt')
        .expect(200);

    expect(retval.text).toBeDefined();
    expect(retval.text.length).toBeGreaterThanOrEqual(RFC_7523_DOC.length - 100);
    expect(retval.text.length).toBeLessThan(RFC_7523_DOC.length + 100);
});

test('Test json_generate endpoint', async () => {

    const retval = await supertest(app)
        .get('/json-generate')
        .expect(200);

    expect(retval.text).toBeDefined();
    expect(retval.text.split('.').length).toBe(3);
});

test('Test if correct service info', async () => {

    const retval = await supertest(app)
        .get('/info')
        .expect(200);

    expect(process.env.EXPECTED_SERVICE_NAME).toBeDefined();

    if (retval.text) {
        expect(retval.text).toBeDefined();
        expect(retval.text.toString().trim()).toBe(process.env.EXPECTED_SERVICE_NAME);
    } else {
        expect(retval.body).toBeDefined();
        expect(retval.body.toString().trim()).toBe(process.env.EXPECTED_SERVICE_NAME);
    }
});

test('Test index.html', async () => {

    const retval = await supertest(app)
        .get('/index.html')
        .expect(200);

    expect(retval.text).toBeDefined();
    expect(retval.text.length).toBeGreaterThanOrEqual(INDEX_HTML.length - 10);
    expect(retval.text.length).toBeLessThan(INDEX_HTML.length + 10);
});