export default abstract class Component {
    private componentRootNodes: Node[]
    private parentNode: Node
    private hasSettledElement: boolean

    protected setElement (nodes: Node | Node[]) {
        this.hasSettledElement = true
        this.componentRootNodes = nodes instanceof Array ? nodes : [nodes]
    }

    public mount (node: Node | Range) {
        if (!this.hasSettledElement) {
            console.warn(`component \`${this.constructor.name}\` is has no settled element.`)
        }
     
        if (node instanceof Node) {
            for (let i = 0; i < this.componentRootNodes.length; i++) {
                node.appendChild(this.componentRootNodes[i])
            } 
        } else if (node instanceof Range) {
            for (let i = this.componentRootNodes.length; i-- >0;) {
                node.insertNode(this.componentRootNodes[i])
            }
        } 

        this.parentNode = this.componentRootNodes[0].parentNode

        this.didMounted()
    }

    public unmount () {
        this.willUnmount()
        this.componentRootNodes.forEach(root => {
            this.parentNode.removeChild(root)
        })
        this.didUnmounted()
    }

    protected didMounted () {

    }

    protected willUnmount () {

    } 

    protected didUnmounted () {

    }
}








