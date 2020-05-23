const jsonwebtoken = require('jsonwebtoken');
const http = require('http');
const fs = require('fs');
const path = require('path');

http.createServer(function (req, res) {
    
    if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('<html><head><title></title></head><body><h1>It works!</h1></body></html>');
    } else if (req.url === '/info') {
        res.writeHead(200, {'Content-Type': 'application/octet-stream'});
        res.end('test-node-plain');
    } else if (req.url === '/rfc2616.txt' || req.url === '/file_read_rfc2616.txt') {
        fs.readFile(
            path.join(__dirname, '/html/rfc2616.txt'),
            { encoding: 'utf8' },
            (err, data) => {
                if (err) {
                    res.writeHead(404, {'Content-Type': 'text/plain'});
                    res.end(`Document not found.`);
                } else {
                    res.writeHead(200, {'Content-Type': 'text/plain'});
                    res.end(data);
                }
            }
        );
    } else if (req.url === '/rfc7523.txt' || req.url === '/file_read_rfc7523.txt') {
        fs.readFile(
            path.join(__dirname, '/html/rfc7523.txt'),
            { encoding: 'utf8' },
            (err, data) => {
                if (err) {
                    res.writeHead(404, {'Content-Type': 'text/plain'});
                    res.end(`Document not found.`);
                } else {
                    res.writeHead(200, {'Content-Type': 'text/plain'});
                    res.end(data);
                }
            }
        );
    } else if (req.url === '/json-generate') {
        const token = jsonwebtoken.sign({
            iat: Date.now(), 
            name: 'customer1', 
            tenant: 'mytenant', 
            id: 'a7c7de38-6755-49d8-91d8-b812630abd65'
        }, "lua-resty-jwt");
        
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(token);
    } else {
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.end(`Not found.`);
    }

}).listen(Number(process.env.PORT) || 8080, '0.0.0.0');

console.log('Server running');
