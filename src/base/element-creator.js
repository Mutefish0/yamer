function ElementCreator(tagName, props) {
    var el = document.createElement(tagName);
    for (var attrName in props) {
        if (attrName !== 'style') {
            el.setAttribute(attrName, props[attrName]);
        }
        else {
            for (var styleName in props[attrName]) {
                el.style[styleName] = props[attrName][styleName];
            }
        }
    }
    return el;
}
export function div(props) {
    return ElementCreator.call(null, 'div', props);
}
export function span(props) {
    return ElementCreator.call(null, 'span', props);
}
export function p(props) {
    return ElementCreator.call(null, 'p', props);
}
export function img(props) {
    return ElementCreator.call(null, 'img', props);
}
export function input(props) {
    return ElementCreator.call(null, 'input', props);
}
export function a(props) {
    return ElementCreator.call(null, 'a', props);
}
export function ul(props) {
    return ElementCreator.call(null, 'ul', props);
}
export function li(props) {
    return ElementCreator.call(null, 'li', props);
}
export function button(props) {
    return ElementCreator.call(null, 'button', props);
}
