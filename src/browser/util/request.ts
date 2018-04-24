import { domain, actionPatterns, matchPattern } from 'common/cross'

const request = async function (name, params?: object, document?: string) {
    const pattern = actionPatterns[name]
    params = params || {}
    document = document || ''
    const url = `${domain}${pattern.stringify(params)}`
    const response = await fetch(url, {
        headers: {
            body: document,
            contentType: 'text/plain'
        }
    })
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