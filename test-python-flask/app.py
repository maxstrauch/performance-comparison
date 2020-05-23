import jwt
import time
from flask import Flask
import os

app = Flask(__name__, static_url_path='', static_folder='html')

@app.route('/json-generate')
def json_generate():
    encoded_jwt = jwt.encode({'iat': time.time(), 'name': 'customer1', 'tenant': 'mytenant', 'id': 'a7c7de38-6755-49d8-91d8-b812630abd65'}, 'lua-resty-jwt', algorithm='HS256')
    return encoded_jwt

@app.route('/file_read_rfc2616.txt')
def deliver_long_text():
    f = open("html/rfc2616.txt", "r")
    data = f.read()
    f.close()
    return data

@app.route('/file_read_rfc7523.txt')
def deliver_long_text_2():
    f = open("html/rfc7523.txt", "r")
    data = f.read()
    f.close()
    return data

@app.route('/index.html')
def deliverIndex():
    return '<html><head><title></title></head><body><h1>It works!</h1></body></html>'

if __name__ == '__main__':
    port = 8080
    if "PORT" in os.environ:
        port = int(os.environ["PORT"])
    from waitress import serve
    serve(app, host="0.0.0.0", port=port)