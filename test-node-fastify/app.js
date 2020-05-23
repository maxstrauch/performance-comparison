const jsonwebtoken = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const fastify = require('fastify')({
    logger: false
});

fastify.register(require('fastify-static'), {
    root: path.join(__dirname, 'html'),
    prefix: '/',
});
  
fastify.get('/index.html', (_, reply) => {
    reply.status(200).type('text/html').send('<html><head><title></title></head><body><h1>It works!</h1></body></html>');
});

fastify.get('/json-generate', (_, reply) => {
    const token = jsonwebtoken.sign({
        iat: Date.now(), 
        name: 'customer1', 
        tenant: 'mytenant', 
        id: 'a7c7de38-6755-49d8-91d8-b812630abd65'
    }, "lua-resty-jwt");

    reply.status(200).type('text/html').send(token);
});

fastify.get('/file_read_rfc2616.txt', (_, reply) => {
    fs.readFile(
        path.join(__dirname, '/html/rfc2616.txt'),
        { encoding: 'utf8' },
        (err, data) => {
            if (err) {
                reply.status(404).type('text/plain').send('Document not found.');
            } else {
                reply.status(200).type('text/plain').send(data);
            }
        }
    );
});

fastify.get('/file_read_rfc7523.txt', (_, reply) => {
    fs.readFile(
        path.join(__dirname, '/html/rfc7523.txt'),
        { encoding: 'utf8' },
        (err, data) => {
            if (err) {
                reply.status(404).type('text/plain').send('Document not found.');
            } else {
                reply.status(200).type('text/plain').send(data);
            }
        }
    );
});

fastify.listen(Number(process.env.PORT) || 8080, '0.0.0.0', (err, address) => {
    if (err) throw err
    console.log(`Server listening on ${address}`);
});