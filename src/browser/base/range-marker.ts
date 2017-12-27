/**
 *  用途：用于获取一个指定range相对光标的状态，提供状态变化的事件
 *  这里的提供的方法只对文本敏感，对元素边界不敏感
 */

import { Observable } from 'rxjs/Rx'
import BoundaryPoint from 'browser/base/boundary-point';
import { observeOn } from 'rxjs/operators/observeOn';
import { inspect } from 'util';

enum StartCaretPosition {
    Inside = 1,
    AdjacentLeft = 1 << 2,
    AdjacentRight = 1 << 3,
    SeparateLeft = 1 << 4,
    SeparateRight = 1 << 5,
}

enum EndCaretPosition {
    Inside = 1 << 8,
    AdjacentLeft = 1 << 9,
    AdjacentRight = 1 << 10,
    SeparateLeft = 1 << 11,
    SeparateRight = 1 << 12,
}

enum CaretStatus {
    Collapsed = 1 << 13,
    Selected = 1 << 14,
    Unknown = 0x00,
    Ignore = ~(CaretStatus.Collapsed | CaretStatus.Selected)
}

// 光标相对一个range的位置
export enum RangeMarkerCaretPosition {
    InsideLeft_And_InsideRighr = StartCaretPosition.Inside | EndCaretPosition.Inside | CaretStatus.Selected,  // 内部选中
    InsideBoth_And_InsideBoth = StartCaretPosition.Inside | EndCaretPosition.Inside | CaretStatus.Collapsed,   // 光标在内部
    Inside_And_SeparateLeft = StartCaretPosition.Inside | EndCaretPosition.SeparateLeft,
    Inside_And_SeparateRight = StartCaretPosition.Inside | EndCaretPosition.SeparateRight,
    Inside_And_AdjacentLeft = StartCaretPosition.Inside | EndCaretPosition.AdjacentLeft,
    Inside_And_AdjacentRight = StartCaretPosition.Inside | EndCaretPosition.AdjacentRight,

    SeparateLeft_And_Inside = StartCaretPosition.SeparateLeft | EndCaretPosition.Inside,
    SeparateLeft_And_SeparateLeft = StartCaretPosition.SeparateLeft | EndCaretPosition.SeparateLeft,
    SeparateLeft_And_SeparateRight = StartCaretPosition.SeparateLeft | EndCaretPosition.SeparateRight,
    SeparateLeft_And_AdjacentLeft = StartCaretPosition.SeparateLeft | EndCaretPosition.AdjacentLeft,
    SeparateLeft_And_AdjacentRight = StartCaretPosition.SeparateLeft | EndCaretPosition.AdjacentRight,

    SeparateRight_And_Inside = StartCaretPosition.SeparateRight | EndCaretPosition.Inside,
    SeparateRight_And_SeparateLeft = StartCaretPosition.SeparateRight | EndCaretPosition.SeparateLeft,
    SeparateRight_And_SeparateRight = StartCaretPosition.SeparateRight | EndCaretPosition.SeparateRight,
    SeparateRight_And_AdjacentLeft = StartCaretPosition.SeparateRight | EndCaretPosition.AdjacentLeft,
    SeparateRight_And_AdjacentRight = StartCaretPosition.SeparateRight | EndCaretPosition.AdjacentRight,

    AdjacentLeft_And_Inside = StartCaretPosition.AdjacentLeft | EndCaretPosition.Inside,
    AdjacentLeft_And_SeparateLeft = StartCaretPosition.AdjacentLeft | EndCaretPosition.SeparateLeft,
    AdjacentLeft_And_SeparateRight = StartCaretPosition.AdjacentLeft | EndCaretPosition.SeparateRight,
    AdjacentLeft_And_AdjacentLeft = StartCaretPosition.AdjacentLeft | EndCaretPosition.AdjacentLeft,
    AdjacentLeft_And_AdjacentRight = StartCaretPosition.AdjacentLeft | EndCaretPosition.AdjacentRight,

    AdjacentRight_And_Inside = StartCaretPosition.AdjacentRight | EndCaretPosition.Inside,
    AdjacentRight_And_SeparateLeft = StartCaretPosition.AdjacentRight | EndCaretPosition.SeparateLeft,
    AdjacentRight_And_SeparateRight = StartCaretPosition.AdjacentRight | EndCaretPosition.SeparateRight,
    AdjacentRight_And_AdjacentLeft = StartCaretPosition.AdjacentRight | EndCaretPosition.AdjacentLeft,
    AdjacentRight_And_AdjacentRight = StartCaretPosition.AdjacentRight | EndCaretPosition.AdjacentRight
}


function every (target, ...conditions) {
    let finalCondition = 0 
    for (let i = 0; i < conditions.length; i++) {
        let condition = conditions[i]
        if (condition instanceof Function) {
            condition = condition(target)
            if (!condition) {
                return false
            }
        } else if (condition instanceof Boolean && !condition) {
            return false
        } else {
            finalCondition = finalCondition | condition
        }
    }
    return !((target ^ finalCondition) & finalCondition)
}

function some (target, ...conditions) {
    let finalCondition = 0
    for (let i = 0; i < conditions.length; i++) {
        let condition = conditions[i]
        if (condition instanceof Function) {
            condition = condition(target)
            if (condition) {
                return true
            }
        } else if (condition instanceof Boolean && condition) {
            return true
        } else {
            finalCondition = finalCondition | condition
        }
    }
    return !!(~(target ^ finalCondition) & finalCondition)
}

function not (condition) {
    return function (target) {
        return !every(target, condition)
    }
}

export default class RangeMarker {
    private currentPosition: RangeMarkerCaretPosition
    private previousPosition: RangeMarkerCaretPosition
    private range: Range 
    private leftBoundaryPoint: BoundaryPoint
    private rightBoundaryPoint: BoundaryPoint
    private caretObservable: Observable<Range>

    private diffSource: Observable<any>

    public caretInSource: Observable<any>
    public caretOutSource: Observable<any>

    constructor (range: Range, caretObservable: Observable<Range>) {
        this.range = range 
        this.caretObservable = caretObservable
        this.previousPosition = RangeMarkerCaretPosition.AdjacentRight_And_AdjacentRight
        this.currentPosition = RangeMarkerCaretPosition.AdjacentRight_And_AdjacentRight
        this.leftBoundaryPoint = BoundaryPoint.fromRangeStart(range)
        this.rightBoundaryPoint = BoundaryPoint.fromRangeEnd(range)

        this.buildObservables()
    }

    private buildObservables () { 
        this.diffSource = this.caretObservable.filter(range => {
            const startBoundaryPoint = BoundaryPoint.fromRangeStart(range)
            const endBoundaryPoint = BoundaryPoint.fromRangeEnd(range)

            const caretStatus = startBoundaryPoint.compareContentOnly(endBoundaryPoint) == 0 
            ? CaretStatus.Collapsed : CaretStatus.Selected

            const startLeftCmp = startBoundaryPoint.compareContentOnly(this.leftBoundaryPoint)
            const startRightCmp = startBoundaryPoint.compareContentOnly(this.rightBoundaryPoint) 
            const endLeftCmp = endBoundaryPoint.compareContentOnly(this.leftBoundaryPoint)
            const endRightCmp = endBoundaryPoint.compareContentOnly(this.rightBoundaryPoint)

            let startCaretPos
            let endCaretPos

            if (startLeftCmp < 0) {
                startCaretPos = StartCaretPosition.SeparateLeft
            } else if (startRightCmp > 0) {
                startCaretPos = StartCaretPosition.SeparateRight
            } else if (startLeftCmp == 0) {
                startCaretPos = StartCaretPosition.AdjacentLeft
            } else if (startRightCmp == 0) {
                startCaretPos = StartCaretPosition.AdjacentRight
            } else if (startLeftCmp > 0 && startRightCmp < 0) {
                startCaretPos = StartCaretPosition.Inside 
            }

            if (endLeftCmp < 0) {
                endCaretPos = EndCaretPosition.SeparateLeft
            } else if (endRightCmp > 0) {
                endCaretPos = EndCaretPosition.SeparateRight
            } else if (endLeftCmp == 0) {
                endCaretPos = EndCaretPosition.AdjacentLeft
            } else if (endRightCmp == 0) {
                endCaretPos = EndCaretPosition.AdjacentRight
            } else if (endLeftCmp > 0 && endRightCmp < 0) {
                endCaretPos = EndCaretPosition.Inside
            }
            
            this.previousPosition = this.currentPosition
            this.currentPosition = startCaretPos | endCaretPos | caretStatus

            return (this.previousPosition & CaretStatus.Ignore) != (this.currentPosition & CaretStatus.Ignore)
        })



        this.caretInSource = this.diffSource.filter(() => {
            return every(this.previousPosition, CaretStatus.Collapsed)
            && !every(this.previousPosition, StartCaretPosition.Inside) 
            &&  every(this.currentPosition, CaretStatus.Collapsed, StartCaretPosition.Inside)
        })


        this.caretOutSource = this.diffSource.filter(() => {
            return every(this.previousPosition, CaretStatus.Collapsed, StartCaretPosition.Inside) 
            && every(this.currentPosition, CaretStatus.Collapsed, not(StartCaretPosition.Inside))
        })

        this.caretOutSource.subscribe(() => {
            console.log('caret out!')
        })

        this.caretInSource.subscribe(() => {
            console.log('caret in!')
        })

    }
}