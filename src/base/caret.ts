import { Boundary } from 'browser/base/boundary-point'

/**
 * @TODO
 * 实例对象可以添加buff之前的字的源
 */

export default class Caret {
    static selection: Selection = window.getSelection()

    static getRange (): Range {
        if (Caret.selection.rangeCount > 0) {
            return Caret.selection.getRangeAt(0)
        } else {
            return null 
        }
    }

    static setRange (range: Range) {
        Caret.selection.removeAllRanges()
        Caret.selection.addRange(range)
    }

    static collapseToElement (el: HTMLElement | Node, toStart: boolean = false) {
        const range = new Range()
        range.selectNodeContents(el)
        Caret.collapseToRange(range)
    }

    static collapseToRange (range: Range, toStart: boolean = false) {
        const boundary = toStart ? Boundary.fromRangeStart(range) : Boundary.fromRangeEnd(range)
        Caret.collapse(boundary)
    }

    static collapse (arg: boolean | Boundary = false) {
        const range = Caret.getRange()
        if (arg instanceof Boolean) {
            arg = arg ? Boundary.fromRangeStart(range) : Boundary.fromRangeEnd(range)
        } 
        Caret.setBoundaries(arg as Boundary, arg as Boundary)
    }

    static setBoundaries (startBoundary: Boundary, endBoundary: Boundary) {
        const range = new Range()
        range.setStart(startBoundary.container, startBoundary.offset)
        range.setEnd(endBoundary.container, endBoundary.offset)
        Caret.setRange(range) 
    }

    static collapseAndAhead (count: number): boolean {
        const boundary = Boundary.fromRangeEnd(Caret.getRange())
        if (boundary.increase(count)) {
            Caret.collapse(boundary)
            return true 
        }
        return false 
    }

    static collapseAndBack (count: number): boolean {
        const boundary = Boundary.fromRangeStart(Caret.getRange())
        if (boundary.decrease(count)) {
            Caret.collapse(boundary)
            return true
        }
        return false 
    }

    static moveAhead (count: number): boolean {
        const range = Caret.getRange()
        const startBoundary = Boundary.fromRangeStart(range)
        const endBoundary = Boundary.fromRangeEnd(range)

        if (startBoundary.increase(count) && endBoundary.increase(count)) {
            Caret.setBoundaries(startBoundary, endBoundary)
            return true 
        } else {
            return false 
        }
    }

    static moveBack (count: number): boolean {
        const range = Caret.getRange()
        const startBoundary = Boundary.fromRangeStart(range)
        const endBoundary = Boundary.fromRangeEnd(range)

        if (startBoundary.decrease(count) && endBoundary.decrease(count)) {
            Caret.setBoundaries(startBoundary, endBoundary)
            return true
        } else {
            return false
        }
    }

    static twist (startVector: number, endVector: number): boolean {
        const range = Caret.getRange()
        const startBoundary = Boundary.fromRangeStart(range)
        const endBoundary = Boundary.fromRangeEnd(range)

        const startAction = startVector > 0 ? Boundary.prototype.increase : (startVector = -startVector, Boundary.prototype.decrease)
        const endAction = endVector > 0 ? Boundary.prototype.increase : (endVector = -endVector, Boundary.prototype.decrease)

        if (startAction.call(startBoundary, startVector) && endAction.call(endBoundary, endVector)) {
            Caret.setBoundaries(startBoundary, endBoundary)
            return true 
        } else {
            return false 
        }
    }

    static grow (statrCount: number, endCount: number): boolean {
        return Caret.twist(-statrCount, endCount)
    }

    static shrink (statrCount: number, endCount: number) {
        const range = Caret.getRange()
        const length = range.toString().length
        if (statrCount + endCount > length) {
            statrCount = endCount = Math.floor(length / 2)
        }
        return Caret.twist(statrCount, endCount)
    }

}