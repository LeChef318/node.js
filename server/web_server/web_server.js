"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var net = require("net");
var forbiddenReq = ["HEAD", "POST", "PUT", "DELETE", "CONNECT", "OPTIONS", "TRACE", "PATCH"];
function newConnection(socket) {
    console.log('new connection incoming', socket.remoteAddress, socket.remotePort);
    socket.on('end', function () {
        console.log('EOF.');
    });
    socket.on('data', function (data) {
        console.log('data:', data);
        console.log('data:', data.toString());
        var res = parseBuffer(data.toString());
        console.log(res);
        socket.write(Buffer.from(res, 'utf8'));
        console.log("Answer sent");
        socket.end();
    });
}
var server = net.createServer();
server.on('connection', newConnection);
server.listen({ host: '127.0.0.1', port: 4242 });
function parseBuffer(bString) {
    try {
        var request = bString.split("\r\n\r\n");
        var headerArr = request[0].split("\r\n");
        var reqHead = headerArr[0].split(" ");
        if (reqHead[1] == "/favicon.ico") {
            return "";
        }
        if (reqHead[0] == "GET") {
            var res = "".concat(reqHead[2], " 200 OK\nContent-Type: text/plain\n\nYou successfully sent a ").concat(reqHead[0], " request to ").concat(reqHead[1], "!\nHave a nice Day\n");
            return res;
        }
        else if (forbiddenReq.includes(reqHead[0])) {
            var res = "".concat(reqHead[2], " 405 Method Not Allowed\nAllow: GET\n");
            return res;
        }
        else {
            var res = "HTTP/1.1 400 Bad Request";
            return res;
        }
    }
    catch (_a) {
        var res = "HTTP/1.1 400 Bad Request";
        return res;
    }
    return "Error";
}
function soInit(socket) {
    var conn = {
        socket: socket, reader: null,
    };
    socket.on('data', function (data) {
        console.assert(conn.reader);
        // pause the 'data' event until the next read.
        conn.socket.pause();
        // fulfill the promise of the current read.
        conn.reader.resolve(data);
        conn.reader = null;
    });
    return conn;
}
