/**
 * @param node <Node>
 * return true if node is element, false if node is text node, otherwhise throw exception
 */
function isContainerOtherwiseText (node: Node): boolean {
    if (node instanceof Text) {
        return false
    } else if (node.nodeType == 1) {
        return true
    } else {
        throw new Error('UnexpectedNodeType')
    }
}

/**
 * 封装BoundaryPoint类，提供最基础的有用的操作
 * 两个BoundaryPoint可以表示一个Range
 * BoundaryPoint的大小可以通过先序遍历的`tree order`来表示，针对不同的root，其大小是不同的。
 * 但是相对另一个BoundaryPoint的大小差值是不变的
 */
export default class BoundaryPoint {
    public container: Text | HTMLElement
    public offset: number

    constructor(container, offset) {
        this.container = container
        this.offset = offset
    }

    /**
     * 移动count，使得其`tree order`增大count
     * @param count 
     */
    public increase (count: number = 1): boolean {
        if (count == 0) {
            return true
        } else if (count < 0) {
            return false
        } // ensure count >= 1 

        let container = this.container
        let offset = this.offset

        if (isContainerOtherwiseText(container)) {
            if (offset < container.childNodes.length) {
                // go in
                let child = container.childNodes[offset]
                this.container = child as HTMLElement | Text
                this.offset = 0
                return this.increase(count - 1)
            } else { // offset == container.childNodes.length
                // go out
                let parent = container.parentNode
                if (parent) {
                    this.container = parent as HTMLElement
                    this.offset = Array.prototype.indexOf.call(parent.childNodes, container) + 1
                    return this.increase(count - 1)
                } else {
                    return false
                }
            }
        } else {
            if (offset + count <= container.textContent.length) {
                this.offset += count
                return true
            } else { 
                // go out 
                let parent = container.parentNode
                if (parent) {
                    this.container = parent as HTMLElement
                    this.offset = Array.prototype.indexOf.call(parent.childNodes, container) + 1
                    return this.increase(count - container.textContent.length + offset - 1)
                } else {
                    return false
                }
            }
        }
    }

    /**
     * 移动count，使得其`tree order`减小count
     * @param count 
     */
    public decrease (count: number = 1): boolean {
        if (count == 0) {
            return true
        } else if (count < 0) {
            return false
        } // ensure count >= 1 

        let container = this.container
        let offset = this.offset

        if (isContainerOtherwiseText(container)) {
            if (offset > 0) {
                // go in
                let child = container.childNodes[offset - 1]
                if (isContainerOtherwiseText(child)) {
                    this.container = child as HTMLElement
                    this.offset = child.childNodes.length
                } else {
                    this.container = child as Text
                    this.offset = child.textContent.length
                }
                return this.decrease(count - 1)
            } else { // offset == 0
                // go out
                let parent = container.parentNode
                if (parent) {
                    this.container = parent as HTMLElement
                    this.offset = Array.prototype.indexOf.call(parent.childNodes, container)
                    return this.decrease(count - 1)
                } else {
                    return false
                }
            }
        } else {
            if (offset >= count) {
                this.offset -= count
                return true
            } else {
                // go out 
                let parent = container.parentNode
                if (parent) {
                    this.container = parent as HTMLElement
                    this.offset = Array.prototype.indexOf.call(parent.childNodes, container)
                    return this.decrease(count - offset - 1)
                } else {
                    return false
                }
            }
        }
    }

}