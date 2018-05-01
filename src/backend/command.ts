import URLPattern from 'url-pattern'
import { actionPatterns } from 'common/cross'
import { IncomingMessage } from 'http'

import setup from './executors/setup'
import document from './executors/document'
import save from './executors/save'
import list from './executors/list'
import newdoc from './executors/new'

const handlers = {
    'setup': setup,
    'document': document,
    'save': save,
    'list': list,
    'new': newdoc
}

const process = async function (req: IncomingMessage) {
    let match
    for (let name in actionPatterns) {
        if (match = actionPatterns[name].match(req.url)) {
            if (handlers[name]) {
                req.setEncoding('utf8')
                try {
                    return await handlers[name](match, req)
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