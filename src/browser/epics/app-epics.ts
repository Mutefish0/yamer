import { observableRequest } from 'browser/util/request'
import { Observable } from 'rxjs'
import { Epic } from './'

import ActionType from 'browser/actions'
import { APP_START_SETUP, fulfilSetup, rejectSetup } from 'browser/actions/app-actions'

const setupAppEpic: Epic<APP_START_SETUP> = (action$, state) =>
	action$
		.ofType(ActionType.APP_START_SETUP)
		.delay(1000)
		.mergeMap(action =>
			observableRequest('setup')
			.mapTo(fulfilSetup())
			.catch(error => Observable.of(rejectSetup(error)))
		)

export default [ setupAppEpic ]
