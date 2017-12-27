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
    private static rangeA: Range = new Range()
    private static rangeB: Range = new Range()

    public container: Text | HTMLElement
    public offset: number

    constructor (container = document as Node, offset = 0) {
        this.setPoint(container, offset)
    }

    setPoint (container, offset) {
        this.container = container
        this.offset = offset
    }

    static fromRangeStart (range: Range) {
        return new BoundaryPoint(range.startContainer, range.startOffset)
    }

    static fromRangeEnd (range: Range) {
        return new BoundaryPoint(range.endContainer, range.endOffset)
    }

    public clone () {
        return new BoundaryPoint(this.container, this.offset)
    }

    /**
     * 移动count，使得其`tree order`增大count
     * @param count 
     * @param textOnly 元素的边界不算在count内
     */
    public increase (count: number = 1, textOnly: boolean = false): boolean {  
        if (count == 0) {
            return true
        } else if (count < 0) {
            return false
        } // ensure count >= 1 

        const elementBorder = textOnly ? 0 : 1
        let container = this.container
        let offset = this.offset

        if (isContainerOtherwiseText(container)) {
            if (offset < container.childNodes.length) {
                // go in
                let child = container.childNodes[offset]
                this.container = child as HTMLElement | Text
                this.offset = 0
                return this.increase(count - elementBorder, textOnly)
            } else { // offset == container.childNodes.length
                // go out
                let parent = container.parentNode
                if (parent) {
                    this.container = parent as HTMLElement
                    this.offset = Array.prototype.indexOf.call(parent.childNodes, container) + 1
                    return this.increase(count - elementBorder, textOnly)
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
                    return this.increase(count - container.textContent.length + offset - elementBorder, textOnly)
                } else {
                    return false
                }
            }
        }
    }

    /**
     * 移动count，使得其`tree order`减小count
     * @param count 
     * @param textOnly 元素的边界不算在count内
     */
    public decrease (count: number = 1, textOnly: boolean = false): boolean {
        if (count == 0) {
            return true
        } else if (count < 0) {
            return false
        } // ensure count >= 1 

        const elementBorder = textOnly ? 0 : 1
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
                return this.decrease(count - elementBorder, textOnly)
            } else { // offset == 0
                // go out
                let parent = container.parentNode
                if (parent) {
                    this.container = parent as HTMLElement
                    this.offset = Array.prototype.indexOf.call(parent.childNodes, container)
                    return this.decrease(count - elementBorder, textOnly)
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
                    return this.decrease(count - offset - elementBorder, textOnly)
                } else {
                    return false
                }
            }
        }
    }

    compare (otherBoundaryPoint: BoundaryPoint) {
        BoundaryPoint.rangeA.setStart(this.container, this.offset)
        BoundaryPoint.rangeB.setStart(otherBoundaryPoint.container, otherBoundaryPoint.offset)
        return BoundaryPoint.rangeA.compareBoundaryPoints(Range.START_TO_START, BoundaryPoint.rangeB)
    }

    compareContentOnly (otherBoundaryPoint: BoundaryPoint) {
        return -this.contentVectorTo(otherBoundaryPoint)
    }

    contentVectorTo (otherBoundaryPoint: BoundaryPoint) {
        const range = new Range()

        if (this.compare(otherBoundaryPoint) > 0) {
            range.setEnd(this.container, this.offset)
            range.setStart(otherBoundaryPoint.container, otherBoundaryPoint.offset)
            return -range.toString().length
        } else if (this.compare(otherBoundaryPoint) < 0) {
            range.setStart(this.container, this.offset)
            range.setEnd(otherBoundaryPoint.container, otherBoundaryPoint.offset)
            return range.toString().length
        } else {
            return 0 
        }
    }

    contentDistanceBetween (otherBoundaryPoint: BoundaryPoint) {
        return Math.abs(this.contentVectorTo(otherBoundaryPoint))
    }

    selectNodeStart (node: Node) {
        BoundaryPoint.rangeA.selectNode(node)
        this.setPoint(BoundaryPoint.rangeA.startContainer, BoundaryPoint.rangeA.startOffset)
    }

    selectNodeEnd (node: Node) {
        BoundaryPoint.rangeA.selectNode(node)
        this.setPoint(BoundaryPoint.rangeA.endContainer, BoundaryPoint.rangeA.endOffset)
    }

    selectNodeContentsStart (node: Node) {
        BoundaryPoint.rangeA.selectNodeContents(node)
        this.setPoint(BoundaryPoint.rangeA.startContainer, BoundaryPoint.rangeA.startOffset)
    }

    selectNodeContentsEnd (node: Node) {
        BoundaryPoint.rangeA.selectNodeContents(node)
        this.setPoint(BoundaryPoint.rangeA.endContainer, BoundaryPoint.rangeA.endOffset)
    }
}