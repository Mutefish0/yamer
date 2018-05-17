import { combineEpics } from 'redux-observable'
import { ActionsObservable } from 'redux-observable'
import { Observable } from 'rxjs'
import { Action } from 'redux'
import { State } from 'browser/store'
import appEpics from './app-epics'
import documentEpics from './document-epics'

export interface Epic<T extends Action, S = State, D = any, O extends Action = any> {
    (action$: ActionsObservable<T>, store: S, dependencies: D): Observable<O>;
}

const rootEpic = combineEpics<any>(...appEpics, ...documentEpics)

export default rootEpic