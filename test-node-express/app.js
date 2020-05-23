const express = require('express');
const jsonwebtoken = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(express.static(path.join(__dirname, 'html')));

app.get('/index.html', function (req, res) {
    res.status(200).type('text/html').send('<html><head><title></title></head><body><h1>It works!</h1></body></html>');
});

app.get('/json-generate', function (req, res) {
    const token = jsonwebtoken.sign({
        iat: Date.now(), 
        name: 'customer1', 
        tenant: 'mytenant', 
        id: 'a7c7de38-6755-49d8-91d8-b812630abd65'
    }, "lua-resty-jwt");

    res.status(200).type('text/html').send(token);
});

app.get('/file_read_rfc2616.txt', function (req, res) {
    fs.readFile(
        path.join(__dirname, '/html/rfc2616.txt'),
        { encoding: 'utf8' },
        (err, data) => {
            if (err) {
                res.status(404).type('text/plain').send('Document not found.');
            } else {
                res.status(200).type('text/plain').send(data);
            }
        }
    );
});

app.get('/file_read_rfc7523.txt', function (req, res) {
    fs.readFile(
        path.join(__dirname, '/html/rfc7523.txt'),
        { encoding: 'utf8' },
        (err, data) => {
            if (err) {
                res.status(404).type('text/plain').send('Document not found.');
            } else {
                res.status(200).type('text/plain').send(data);
            }
        }
    );
});

app.listen(Number(process.env.PORT) || 8080, function () {
  console.log('Server listening ..');
});
