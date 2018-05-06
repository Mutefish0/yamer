import { domain, actionPatterns, matchPattern } from 'common/cross'

const request = async function (name, params?: object, document?: object) {
    const pattern = actionPatterns[name]
    params = params || {}
    let method = document ? 'post' : 'get'
    let reqDomain = process.env.NODE_ENV == 'development' ? window.location.origin : domain
    const url = `${reqDomain}${pattern.stringify(params)}`
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

export default request