import BoundaryPoint from 'browser/base/boundary-point'
import Rangy from 'browser/base/rangy'

/**
 * 针对纯文本的Range封装
 */
export default class ContentRange extends Rangy {
    static INSIDE = 0
    static LEFT_ADJACENT = 1
    static RIGHT_ADJACENT = 2
    static NONE_ADJACENT = 3

    static fromRange (range: Range) {
        const contentRange = new ContentRange()
        contentRange.setStart(range.startContainer, range.startOffset)
        contentRange.setEnd(range.endContainer, range.endOffset)
        return contentRange
    }

    public extendLeft (count) {
        super.extendLeftContent(count)
    }

    public extendRight (count) {
        super.extendRightContent(count)
    }

    public positionWith (point: BoundaryPoint) {
        const leftBp = new BoundaryPoint(this.startContainer, this.startOffset)
        const rightBp = new BoundaryPoint(this.endContainer, this.endOffset)
        const toLeftContentVector = point.contentVectorTo(leftBp)
        const toRightContentVector = point.contentVectorTo(rightBp)

        if (toLeftContentVector < 0 && toRightContentVector > 0) {
            return ContentRange.INSIDE
        } else if (toLeftContentVector == 0) {
            return ContentRange.LEFT_ADJACENT
        } else if (toRightContentVector == 0) {
            return ContentRange.RIGHT_ADJACENT
        } else {
            return ContentRange.NONE_ADJACENT
        }
    }
}
