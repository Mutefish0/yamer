import { domain, actionPatterns, matchPattern } from 'common/cross'
import { Observable } from 'rxjs'
import { Response } from 'common/cross'

const request = async function (name, params?: object, document?: object): Promise<Response> {
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

const observableRequest = (...args): Observable<Response> => Observable.from(request.apply(null, args))

export { observableRequest }

export default request