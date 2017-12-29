/**
 *  用途：用于获取一个指定range相对光标的状态，提供状态变化的事件
 *  这里的提供的方法只对文本敏感，对元素边界不敏感
 */

import { Observable, Subscription } from 'rxjs/Rx'
import { Boundary } from 'browser/base/boundary-point';

/**
 * @TODO
 * 可以使用Imutable表示数组conditions, 通过比较target和conditions来进行缓存操作
 * @TODO
 * 可以封装成一个单独的文件，封装包括逻辑操作以及位实体的创建
 */
/**
 * 按位条件同时满足
 * @param target 
 * @param conditions 
 */
export function every (target, ...conditions) {
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

export const has  = every

/**
 * 按位条件至少有一个满足
 * @param target 
 * @param conditions 
 */
export function some (target, ...conditions) {
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

export function not (condition) {
    return function (target) {
        return !every(target, condition)
    }
}

export function and (...conditions) {
    return function (target) {
        return every(target, ...conditions)
    }
}

export function or (...conditions) {
    return function (target) {
        return some(target, ...conditions)
    }
}

export enum StartCaretPosition {
    Inside = 1,
    AdjacentLeft = 1 << 2,
    AdjacentRight = 1 << 3,
    SeparateLeft = 1 << 4,
    SeparateRight = 1 << 5
}


export enum EndCaretPosition {
    Inside = 1 << 6,
    AdjacentLeft = 1 << 7,
    AdjacentRight = 1 << 8,
    SeparateLeft = 1 << 9,
    SeparateRight = 1 << 10
}

export enum CaretStatus {
    Collapsed = 1 << 11,
    Selected = 1 << 12,
    Unknown = 0x00,
    Ignore = ~(CaretStatus.Collapsed | CaretStatus.Selected)
}

// 指定哪一边是活动的，即(Selection::focusNode, Selection::focusOffset)
export enum CaretActive {
    Start = 1 << 13,
    End = 1 << 14
}

export const ActiveCaretPosition = {
    Inside: or(and(StartCaretPosition.Inside, CaretActive.Start), and(EndCaretPosition.Inside, CaretActive.End)),
    AdjacentLeft: or(and(StartCaretPosition.AdjacentLeft, CaretActive.Start), and(EndCaretPosition.AdjacentLeft, CaretActive.End)),
    AdjacentRight: or(and(StartCaretPosition.AdjacentRight, CaretActive.Start), and(EndCaretPosition.AdjacentRight, CaretActive.End)),
    SeparateLeft: or(and(StartCaretPosition.SeparateLeft, CaretActive.Start), and(EndCaretPosition.SeparateLeft, CaretActive.End)),
    SeparateRight: or(and(StartCaretPosition.SeparateRight, CaretActive.Start), and(EndCaretPosition.SeparateRight, CaretActive.End))
}

// 开始和结束光标分别分离在Range左右侧
const OP_SEPARATE_SURROUND = and(StartCaretPosition.SeparateLeft, EndCaretPosition.SeparateRight)

// 开始和结束光标正好选中Range
const OP_ADJACENT_SURROUND = and(StartCaretPosition.AdjacentLeft, EndCaretPosition.AdjacentRight)
const OP_JUST_SELECTED = OP_ADJACENT_SURROUND
// 光标是闭合的，且贴近Range左侧
const OP_ADJACENT_LEFT = and(StartCaretPosition.AdjacentLeft, EndCaretPosition.AdjacentLeft)
// 光标是闭合的，且贴近Range右侧
const OP_ADJACENT_RIGHT = and(StartCaretPosition.AdjacentRight, EndCaretPosition.AdjacentRight)


// 光标相对一个range的位置
export enum MarkerCaretPosition {
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


// Range的内容全部都被选中了
const OP_FULL_SELECTED = or(OP_JUST_SELECTED, OP_SEPARATE_SURROUND, 
    and(StartCaretPosition.SeparateLeft, EndCaretPosition.AdjacentRight),
    and(StartCaretPosition.AdjacentLeft, EndCaretPosition.SeparateRight)
)

// Range的部分内容被选中
const OP_PARTIAL_SELECTED = and(CaretStatus.Selected, or(StartCaretPosition.Inside, EndCaretPosition.Inside))


export enum MarkerSource {
    CaretIn = 0,
    CaretOut,
    CaretAdjacentLeft,
    CaretAdjacentRight 
}

export default class RangeMarker {
    private currentPosition: MarkerCaretPosition = MarkerCaretPosition.AdjacentRight_And_AdjacentRight
    private previousPosition: MarkerCaretPosition = MarkerCaretPosition.AdjacentRight_And_AdjacentRight
    private range: Range 
    private rootRange: Range

    public leftBoundary: Boundary
    public rightBoundary: Boundary

    private diffSource: Observable<{ previous: MarkerCaretPosition, current: MarkerCaretPosition }>
    
    private sourceList: Observable<any>[] 
    private subscriptionList: Subscription[] = []
    // states
    public isLeftAdjacent: boolean
    public isRightAdjacent: boolean
    public isFullSelected: boolean 
    public isPartialSelected: boolean
    public isJustSelected: boolean

    constructor (markerElementRange: HTMLElement | Range, rootElement: HTMLElement) {
        this.range
        this.rootRange = new Range()
        this.previousPosition = MarkerCaretPosition.AdjacentRight_And_AdjacentRight
        this.currentPosition = MarkerCaretPosition.AdjacentRight_And_AdjacentRight
        
        if (markerElementRange instanceof Range) {
            this.range = markerElementRange
        } else {
            this.range = new Range()
            this.range.selectNode(markerElementRange) 
        }

        this.leftBoundary = Boundary.fromRangeStart(this.range)
        this.rightBoundary = Boundary.fromRangeEnd(this.range)
        this.rootRange.selectNode(rootElement)

        this.buildSources()
        this.subscribeSources()
    }

    private buildSources () { 
        const selection = document.getSelection()
        const documentChangeSource = Observable.fromEvent(document, 'selectionchange')
        // ensure `selection` has at least one range
        const ensureChangeSource = documentChangeSource
            .filter(() => selection.rangeCount > 0)
            .map(() => ({ range: selection.getRangeAt(0), selection }))
        // filter caret change event outside `rootRange`
        const restrictedChangeSource = ensureChangeSource
            .filter(({ range }) => (
                this.rootRange.compareBoundaryPoints(Range.START_TO_START, range) <= 0 
                && this.rootRange.compareBoundaryPoints(Range.END_TO_END, range) >= 0
            ))
        // map `range` to MarkerCaretPosition
        this.mapRangeToMarkerCaretPosition = this.mapRangeToMarkerCaretPosition.bind(this)
        const positionChangeSource = restrictedChangeSource.map(this.mapRangeToMarkerCaretPosition)
        // track previous position
        const trackSource = positionChangeSource.scan((prev, curr) => 
            ({ previous: prev.current, current: curr }), 
            { previous: this.previousPosition, current: this.currentPosition }
        )

        // filter caret change events insensitive to `this.range`
        this.diffSource = trackSource.filter(({ previous, current })=> {
            return (previous & CaretStatus.Ignore) != (current & CaretStatus.Ignore)
        })

        // builtin useful caret events
        const caretInSource = this.diffSource.filter(({ previous, current }) => {
            return every(previous, CaretStatus.Collapsed, not(StartCaretPosition.Inside))
                && every(current, CaretStatus.Collapsed, StartCaretPosition.Inside)
        }).map(({ previous, current }) => ({
            direction: some(previous, StartCaretPosition.AdjacentLeft, StartCaretPosition.SeparateLeft) ? 1 : -1
        }))

        const caretOutSource = this.diffSource.filter(({ previous, current }) => {
            return every(previous, CaretStatus.Collapsed, StartCaretPosition.Inside) 
                && every(current, CaretStatus.Collapsed, not(StartCaretPosition.Inside))
        }).map(({ previous, current }) => ({
            direction: some(current, StartCaretPosition.AdjacentLeft, StartCaretPosition.SeparateLeft) ? -1 : 1
        }))

        const caretAdjacentLeftSource = this.diffSource.filter(({ previous, current }) => 
            every(previous, not(OP_ADJACENT_LEFT))
            && every(current, OP_ADJACENT_LEFT))
            .map(({ previous, current }) => ({
                direction: every(previous, ActiveCaretPosition.SeparateLeft) ? 1 : -1
            }))
        const caretAdjacentRightSource = this.diffSource.filter(({ previous, current }) =>
            every(previous, OP_ADJACENT_LEFT)
            && every(current, OP_ADJACENT_RIGHT))
            .map(({ previous, current }) => ({
                direction: every(previous, ActiveCaretPosition.SeparateRight) ? -1 : 1
            }))

        this.sourceList = [caretInSource, caretOutSource, caretAdjacentLeftSource, caretAdjacentRightSource]
    }

    private mapRangeToMarkerCaretPosition ({ range, selection }) {
        const startBoundary = Boundary.fromRangeStart(range)
        const endBoundary = Boundary.fromRangeEnd(range)

        const caretStatus = startBoundary.compare(endBoundary) == 0
            ? CaretStatus.Collapsed : CaretStatus.Selected

        const caretActive =
            (startBoundary.container == selection.focusNode && startBoundary.offset == selection.focusOffset) ?
                CaretActive.Start : CaretActive.End

        const startLeftCmp = startBoundary.compare(this.leftBoundary)
        const startRightCmp = startBoundary.compare(this.rightBoundary)
        const endLeftCmp = endBoundary.compare(this.leftBoundary)
        const endRightCmp = endBoundary.compare(this.rightBoundary)

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

        return startCaretPos | endCaretPos | caretActive | caretStatus
    }

    private subscribeSources () {
        this.diffSource.subscribe(this.updatePositionAndState.bind(this))
    }

    private updatePositionAndState ({ previous, current }) {
        this.previousPosition = previous
        this.currentPosition = current

        this.isFullSelected = OP_FULL_SELECTED(current)
        this.isJustSelected = OP_JUST_SELECTED(current)
        this.isLeftAdjacent = OP_ADJACENT_LEFT(current) 
        this.isRightAdjacent = OP_ADJACENT_RIGHT(current)
        this.isPartialSelected = OP_PARTIAL_SELECTED(current)
    }

    public subscribe (source: MarkerSource, subscriber: (any) => any) {
        const subscription = this.sourceList[source].subscribe(subscriber)
        this.subscriptionList.push(subscription)
        return subscription
    }

    public dispose () {
        this.subscriptionList.forEach(subscription => {
            if (!subscription.closed) {
                subscription.unsubscribe()
            }
        })
    }
}