import { domain, actionPatterns, matchPattern } from 'common/cross'

const request = async function (name, params?: object, document?: object) {
    const pattern = actionPatterns[name]
    params = params || {}
    let method = document ? 'post' : 'get'
    const url = `${domain}${pattern.stringify(params)}`
    let options = {
        method,
        headers: {
            contentType: 'application/json'
        }
    }
    if (document) {
        options = Object.assign(options, { body: JSON.stringify(document)})       
    }

    const response = await fetch(url, options)
    return await response.json()
}

function dealSchemaRequest (url) {
    const matchSchema = url.match(/^yamer:\/\/(.*)/)
    if (matchSchema) {
        const path = `/${matchSchema[1]}`
        if (matchPattern(path)) {
            alert(url)
        }
    }
}

document.addEventListener('click', function (e) {
    if (e.target['href']) {
        dealSchemaRequest(e.target['href'])
    }
})

export default request