import { port } from 'common/cross'
import Command from './command'
import http from 'http'
import URL from 'url'

const server = http.createServer(async function (req, resp) {
    resp.statusCode = 200;
    resp.setHeader('Content-Type', 'application/json');
    try {
        const result = await Command.process(req)
        resp.end(JSON.stringify({ result }))
    } catch (error) {
        resp.end(JSON.stringify({ error }))
    }
}) 

server.listen(port)
