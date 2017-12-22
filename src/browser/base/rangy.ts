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
    public extendLeftBoundary (count: number): boolean {
        const bp = new BoundaryPoint(this.startContainer, this.startOffset)
        if (bp.decrease(count)) {
            this.setStartFromPoint(bp)
            return true
        } else {
            return false
        }
    }

    /**
     * 不修改原来的对象，返回新的对象
     */
    public leftBoundaryExtended (count: number): Rangy {
        let clonedRangy = this.clone()
        if (clonedRangy.extendLeftBoundary(count)) {
            return clonedRangy
        } else {
            return null
        }
    }

    /**
     * 扩展右边界
     */
    public extendRightBoundary (count: number): boolean {
        const bp = new BoundaryPoint(this.endContainer, this.endOffset)
        if (bp.increase(count)) {
            this.setEndFromPoint(bp)
            return true
        } else {
            return false
        }
    }

    /**
     * 不修改原来的对象，返回新的对象
     */
    public rightBoundaryExtended (count: number): Rangy {
        let clonedRangy = this.clone()
        if (clonedRangy.extendRightBoundary(count)) {
            return clonedRangy
        } else {
            return null
        }
    }

    public extendLeftContent (count: number): boolean {
        try {
            return true
        } catch (e) {
            return false
        }
    }

    public extendRightContent (count: number): boolean {
        try {
            return true
        } catch (e) {
            return false
        }
    }
}
