"use strict"
import { readFile } from "fs/promises";
import * as path from "path";
const forbiddenReq = ["HEAD", "POST", "PUT", "DELETE", "CONNECT", "OPTIONS", "TRACE", "PATCH"];

class Request {
    _httpMethod
    _resource
    _protocol
    _headers
    _badRequest
    constructor(buffer) {
        this._badRequest = 0
        this.parseRequest(buffer.toString());
        this.checkHttpMethod();
    }
    parseRequest(bString) {
        let request = bString.split("\r\n\r\n")
        if(request.length != 2){
            this._badRequest = 400
            return
        }
        let headerArr = request[0].split("\r\n");
        let reqHead = headerArr[0].split(" ");
        if(reqHead.length != 3) {
            this._badRequest = 400
            return
        }
        this._httpMethod = reqHead[0]
        this._resource = reqHead[1]
        this._protocol = reqHead[2]
        headerArr.shift()
        this._headers = new Map()
        for (let line of headerArr) {
            let split = line.split(" ")
            this._headers.set(split[0], split[1])
        }
        return
    }
    checkHttpMethod() {
        if(forbiddenReq.includes(this._httpMethod)) {
            this._badRequest = 405
        }
        return
    }
    get badRequest() {
        return this._badRequest
    }

}

class Response {
    _protocol
    _status
    _statusMsg
    _headers
    _body

    constructor() {
        this._headers = new Map()
    }
    set protocol(newProtocol) {
        this._protocol = newProtocol
    }
    set status(newStatus) {
        this._status = newStatus
    }
    set statusMsg(newStatusMsg) {
        this._statusMsg = newStatusMsg
    }
    set body(newBody) {
        this._body = newBody
    }
    addHeader(fieldname, token) {
        this._headers.set(fieldname, token)
    }
    async create4xx(errNr) {
        this._protocol = "HTTP/1.1"
        this._status = errNr
        if(errNr == 400) {
            this._statusMsg = "Bad request"
            this.addHeader("Content-Type:", "application/json")
            try {
                this._body = await readFile("./resources/400.json")
                let cntLength = this._body.length
                this.addHeader("Content-Length:", cntLength.toString())
            }
            catch {
                console.log("something went wrong")
            }
        }
        else if(errNr == 404) {
            this._statusMsg = "Not found"
            this.addHeader("Content-Type:", "text/html; charset=UTF-8")
            try {
                this._body = await readFile("./resources/404.html")
                let cntLength = this._body.length
                this.addHeader("Content-Length:", cntLength.toString())
            }
            catch {
                console.log("something went wrong")
            }
        }
        else if(errNr == 405) {
            this._statusMsg = "Method Not Allowed"
            this.addHeader("Allow:", "GET")
            this.addHeader("Content-Length:", "0")
        }
        else if(errNr == 403) {
            this._statusMsg = 'Forbidden';
            this.addHeader('Content-Type:', 'text/plain');
            this._body = 'Access Denied';
            this.addHeader('Content-Length:', this._body.length.toString());
        }
    }
    async createResponse(resource) {
        const rootDir = path.resolve('./resources')
        let filepath = resource === '/' ? '/index.html' : resource
        const normalizedPath = path.normalize(path.join(rootDir, filepath))
        if (!normalizedPath.startsWith(rootDir)) {
            await this.create4xx(403)
            return;
        }
        try {
            const contentType = this.getContentType(filepath)
            this._body = await readFile(normalizedPath)
            this._protocol = "HTTP/1.1"
            this._status = 200
            this._statusMsg = "OK"
            this.addHeader('Content-Type', contentType)
            this.addHeader("Content-Length:", this._body.length.toString())
        }
        catch (err) {
            console.log("Error reading file:", err)
            await this.create4xx(404)
        }
    }
    getContentType(filepath) {
        const ext = path.extname(filepath).toLowerCase()
        const contentTypes = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.gif': 'image/gif',
        }
        return contentTypes[ext] || 'application/octet-stream';
    }

    parseResponse() {
        let headers = `${this._protocol} ${this._status} ${this._statusMsg}\r\n`
        for (const [key, value] of this._headers) {
            headers += `${key}: ${value}\r\n`
        }
        headers += '\r\n'

        return Buffer.concat([Buffer.from(headers), this._body])
    }
}

export {Request, Response}