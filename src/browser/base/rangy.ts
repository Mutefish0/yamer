import BoundaryPoint from 'browser/base/boundary-point'

/**
 * 在Range类的基础上新增比较有用的方法
 * @NOTE 暂未考虑包含Comment, CDATA等节点的情况
 */
export default class Rangy extends Range {
    static selection: Selection = window.getSelection()

    /**
     * 从光标或选中对象处克隆出一个Rangy对象
     */
    static fromWindowSelection (): Rangy {
        return Rangy.fromRangeLike(Rangy.selection.getRangeAt(0))
    }

    /**
     * 由Range或Rangy对象克隆出一个Rangy对象 
     */
    static fromRangeLike (range: Range | Rangy): Rangy {
        let rangy = new Rangy()

        rangy.setStart(range.startContainer, range.startOffset)
        rangy.setEnd(range.endContainer, range.endOffset)

        return rangy
    }

    
    public setStartFromPoint (point: BoundaryPoint) {
        this.setStart(point.container, point.offset)
    }

    public setEndFromPoint (point: BoundaryPoint) {
        this.setEnd(point.container, point.offset)
    }

    public clone () {
        return Rangy.fromRangeLike(this)
    }

    /**
     * 扩展左边界
     */
    public extendLeftBoundary (count: number, textOnly: boolean = false): boolean {
        const bp = new BoundaryPoint(this.startContainer, this.startOffset)
        if (bp.decrease(count, textOnly)) {
            this.setStartFromPoint(bp)
            return true
        } else {
            return false
        }
    }

    /**
     * 不修改原来的对象，返回新的对象
     */
    public leftBoundaryExtended (count: number, textOnly: boolean = false): Rangy {
        let clonedRangy = this.clone()
        if (clonedRangy.extendLeftBoundary(count, textOnly)) {
            return clonedRangy
        } else {
            return null
        }
    }

    /**
     * 扩展右边界
     */
    public extendRightBoundary (count: number, textOnly: boolean = false): boolean {
        const bp = new BoundaryPoint(this.endContainer, this.endOffset)
        if (bp.increase(count, textOnly)) {
            this.setEndFromPoint(bp)
            return true
        } else {
            return false
        }
    }

    /**
     * 不修改原来的对象，返回新的对象
     */
    public rightBoundaryExtended (count: number, textOnly: boolean = false): Rangy {
        let clonedRangy = this.clone()
        if (clonedRangy.extendRightBoundary(count, textOnly)) {
            return clonedRangy
        } else {
            return null
        }
    }

    /**
     * @param count 指定扩展的字符数
     */
    public extendLeftContent (count: number): boolean {
        return this.extendLeftBoundary(count, true)
    }

    /**
     * 
     * @param count 字符数
     * 返回新的Rangy对象
     */
    public leftContentExtended (count: number): Rangy {
        return this.leftBoundaryExtended(count, true)
    }

    /**
     * @param count 指定扩展的字符数
     */
    public extendRightContent (count: number): boolean {
        return this.extendRightBoundary(count, true)
    }

    /**
     * @param count 字符数 
     * 返回新的Rangy对象
     */
    public rightContentExtended (count: number): Rangy {
        return this.rightBoundaryExtended(count, true)
    }

}
