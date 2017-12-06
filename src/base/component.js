var Component = /** @class */ (function () {
    function Component() {
        this.fragment = document.createDocumentFragment();
        this.refs = this.construct(this.fragment);
        this.wiring(this.refs);
    }
    Component.prototype.mount = function (node) {
        node.appendChild(this.fragment);
        this.parentNode = node;
        this.componentRootNode = this.fragment.children[0];
    };
    Component.prototype.unmount = function () {
        this.parentNode.removeChild(this.componentRootNode);
    };
    return Component;
}());
export default Component;
