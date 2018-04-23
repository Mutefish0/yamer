import { domain, patterns } from 'common/cross'

const request = async function (name, params?: object, document?: string) {
    const pattern = patterns[name]
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

export default request