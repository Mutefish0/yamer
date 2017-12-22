function ElementCreator (tagName, props?: Object): HTMLElement {
    let el = document.createElement(tagName)
    for (let attrName in props) {
        if (attrName !== 'style') {
            if (attrName == 'innerText' || attrName == 'textContent'|| attrName == 'innerHTML') {
                el[attrName] = props[attrName]
            } else {
                el.setAttribute(attrName, props[attrName])
            }
        } else {
            for (let styleName in props[attrName]) {
                el.style[styleName] = props[attrName][styleName]
            }
        }
    }
    return el
}

export function div (props?): HTMLDivElement {
    return ElementCreator.call(null, 'div', props)
}

export function span (props?): HTMLSpanElement {
    return ElementCreator.call(null, 'span', props)
}

export function p (props?): HTMLParagraphElement {
    return ElementCreator.call(null, 'p', props)
}

export function img (props?): HTMLImageElement {
    return ElementCreator.call(null, 'img', props)
}

export function input (props?): HTMLInputElement {
    return ElementCreator.call(null, 'input', props)
}

export function a (props?): HTMLLinkElement {
    return ElementCreator.call(null, 'a', props)
}

export function ul (props?): HTMLUListElement {
    return ElementCreator.call(null, 'ul', props)
}

export function li (props): HTMLLIElement {
    return ElementCreator.call(null, 'li', props)
}

export function button (props): HTMLButtonElement {
    return ElementCreator.call(null, 'button', props)
}

export function text (content): Text {
    return document.createTextNode(content)
}