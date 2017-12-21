export default abstract class Component{
    private fragment: DocumentFragment
    private componentRootNode: Node
    private parentNode: Node
    private refs: { [key: string]: HTMLElement }

    constructor () {
        this.fragment = document.createDocumentFragment()
        this.build(this.fragment)
    }

    abstract build (container: DocumentFragment)

    mount (node: Node) {
        node.appendChild(this.fragment)
        this.parentNode = node 
        this.componentRootNode = this.fragment.children[0]
    }

    unmount () {
        this.parentNode.removeChild(this.componentRootNode)
    }
}








