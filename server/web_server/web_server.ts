import * as net from "net";
import * as fs from "fs"

const forbiddenReq: String[] = ["HEAD", "POST", "PUT", "DELETE", "CONNECT", "OPTIONS", "TRACE", "PATCH"]

function newConnection(socket: net.Socket): void {
    console.log('new connection incoming', socket.remoteAddress, socket.remotePort)

    socket.on('end', () => {
        console.log('EOF.');
        });
    socket.on('data', (data: Buffer) => {
        console.log('data:', data);
        console.log('data:', data.toString())
        let res = parseBuffer(data.toString())
        console.log(res)
        socket.write(Buffer.from(res, 'utf8'));
        console.log("Answer sent")
        socket.end()
        });
}



let server = net.createServer();
server.on('connection', newConnection)
server.listen({host: '127.0.0.1', port: 4242});


function parseBuffer(bString:String): String {
    try{
        let request = bString.split("\r\n\r\n");
        let headerArr = request[0].split("\r\n");
        let reqHead = headerArr[0].split(" ");
        if(reqHead[1] == "/favicon.ico") {
            return ""
        }
        if(reqHead[0] == "GET") {
            let res = `${reqHead[2]} 200 OK
Content-Type: text/plain

You successfully sent a ${reqHead[0]} request to ${reqHead[1]}!
Have a nice Day
`
            return res
        }
        else if (forbiddenReq.includes(reqHead[0])) {
            let res = `${reqHead[2]} 405 Method Not Allowed
Allow: GET
`
            return res
        }
        else {
            let res = `HTTP/1.1 400 Bad Request`
            return res
        }
    }
    catch{
        let res = `HTTP/1.1 400 Bad Request`
        return res
    }
    return "Error"
}


type TCPConn = {
    socket: net.Socket;
    reader: null|{
        resolve: (value: Buffer) => void,
        reject: (reason: Error) => void,
    };
};


function soInit(socket: net.Socket): TCPConn {
    const conn: TCPConn = {
    socket: socket, reader: null,
    };
    socket.on('data', (data: Buffer) => {
    console.assert(conn.reader);
    // pause the 'data' event until the next read.
    conn.socket.pause();
    // fulfill the promise of the current read.
    conn.reader!.resolve(data);
    conn.reader = null;
    });
    return conn;
    }