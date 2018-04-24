import URLPattern from 'url-pattern'
import { actionPatterns } from 'common/cross'
import { IncomingMessage } from 'http';

import setup from './executors/setup'
import document from './executors/document'

const handlers = {
    'setup': setup,
    'document': document
}

const process = async function (req: IncomingMessage) {
    let match
    for (let name in actionPatterns) {
        if (match = actionPatterns[name].match(req.url)) {
            if (handlers[name]) {
                req.setEncoding('utf8')
                let text = '', chunk = ''
                while (chunk = req.read()) {
                    text += chunk
                }
                try {
                    return await handlers[name](match, text)
                } catch (error) {
                    throw error
                }
            } else {
                throw 'no implemention'
            }
        } 
    }
    throw 'unknown request'
}

const Command = { process }

export default Command 