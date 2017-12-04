export default abstract class Component {
    private fragment: DocumentFragment
    private componentRootNode: Node
    private parentNode: Node
    private refs: { [key: string]: HTMLElement }

    constructor () {
        this.fragment = document.createDocumentFragment()
        this.refs = this.construct(this.fragment)
        this.wiring(this.refs)
    }

    abstract construct(container: DocumentFragment): { [key: string]: HTMLElement }

    abstract wiring (elements: { [key: string]: HTMLElement }): any

    mount (node: Node) {
        node.appendChild(this.fragment)
        this.parentNode = node 
        this.componentRootNode = this.fragment.children[0]
    }

    unmount () {
        this.parentNode.removeChild(this.componentRootNode)
    }
}








