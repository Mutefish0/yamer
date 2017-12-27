export default abstract class Component{
    private fragment: DocumentFragment
    private componentRootNodes: Node[]
    private parentNode: Node
    private hasSettledElement: boolean

    protected setElement (nodes: Node | Node[]) {
        this.hasSettledElement = true
        this.fragment = document.createDocumentFragment()
        this.componentRootNodes = nodes instanceof Array ? nodes : [nodes]
    }

    public mount (node: Node | Range) {
        if (!this.hasSettledElement) {
            console.warn(`component \`${this.constructor.name}\` is has no settled element.`)
        }

        let mountFunc = null        
        if (node instanceof Node) {
            mountFunc = node.appendChild
        } else if (node instanceof Range) {
            mountFunc = node.insertNode
        } else {
            mountFunc = () => {}
        }

        this.componentRootNodes.forEach(root => {
            if (root) {
                mountFunc.call(node, root)
            }
        });

        this.parentNode = this.componentRootNodes[0].parentNode
    }

    public unmount () {
        this.componentRootNodes.forEach(root => {
            this.parentNode.removeChild(root)
        })
    }
}








