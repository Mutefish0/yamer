import { combineEpics } from 'redux-observable'
import { ActionsObservable } from 'redux-observable'
import { Observable } from 'rxjs'
import { Action, MiddlewareAPI } from 'redux'
import { State } from 'browser/store'
import appEpics from './app-epics'
import documentEpics from './document-epics'
import mixinEpics from './mixin-epics'

export interface Epic<T extends Action, S = State, D = any, O extends Action = Action> {
    (action$: ActionsObservable<T>, store: MiddlewareAPI<any, State>, dependencies: D): Observable<O>;
}

const rootEpic = combineEpics<any>(
    ...appEpics, ...documentEpics, ...mixinEpics
)

export default rootEpic