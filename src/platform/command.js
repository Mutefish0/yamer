import cross from 'common/cross'

import setup from './executors/setup'

const commands = {
    'setup': setup
}

const process = async function (command, params) {
    try {
        const handler = commands[command]
        if (handler) {
            return await handler(params)
        } else {
            throw `unknown_command: ${command}`
        }
    } catch (error) {
        throw 'unexpected parmas'
    }
}

const Command = { process }

export default Command 