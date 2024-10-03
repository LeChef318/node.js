"use strict";
import { createServer } from "net";
import {Request, Response} from "./helpers.js"
function newConnection(socket) {
    console.log('new connection incoming', socket.remoteAddress, socket.remotePort);
    socket.on('end', function () {
        console.log('EOF.');
    });
    socket.on('data', function (data) {
        handleRequest(socket, data).catch(err => {
            console.error("Error:", err);
            socket.end("HTTP/1.1 500 Internal Server Error\r\n\r\n");
        });
    });
}
async function handleRequest(socket, data) {
    console.log('data:', data);
    let req = new Request(data)
    let res = new Response()
    if(req.badRequest != 0) {
        await res.create4xx(req.badRequest)
    }
    else {
        await res.createResponse(req._resource)
    }
    console.log(res.parseResponse())
    socket.write(res.parseResponse())
    console.log("Answer sent");
    socket.end();
}


var server = createServer()
server.on('connection', newConnection)
server.listen({ host: '127.0.0.1', port: 4242 })
