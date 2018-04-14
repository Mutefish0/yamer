import cross from 'common/cross'
import Command from './command'
import http from 'http'
import URL from 'url'

const server = http.createServer(async function (req, resp) {
    const url = URL.parse(req.url, true)
    let command   
    if ( 
        (command = url.pathname) 
        && (command = command.match(/command\/(.+)$/))
        && (command = command[1])
    ) {
        resp.statusCode = 200;
        resp.setHeader('Content-Type', 'application/json');
        try {
            const result = await Command.process(command, url.query)
            resp.end(result)
        } catch (error) {
            resp.end(JSON.stringify({ error }))
        }
    } else {
        resp.writeHead(404)
        resp.end()
    }
})

server.listen(cross.port)
