
import {assert, assMatch} from 'sjtest';
import Login from 'you-again';
import PV from 'promise-value';

import C from '../C';

import ServerIO from './ServerIO';
import DataStore from '../base/plumbing/DataStore';
import {getId, getType} from '../base/data/DataClass';

import ActionMan from '../base/plumbing/ActionManBase';

ActionMan.saveGlobal = (globId) => {
	assMatch(globId, String);
	let global = DataStore.getData(C.TYPES.Global, globId);
	if ( ! global.id) {
		assert(globId==='new');
		global.id = globId;
	}
	let prevStatus = DataStore.getValue(['transient', globId, 'status']);
	DataStore.setValue(['transient', globId, 'status'], C.STATUS.saving);
	ServerIO.saveGlobal(global)
	.then(DataStore.updateFromServer.bind(DataStore))
	.fail((bleurgh) => {
		console.warn("bleurgh", bleurgh);
		DataStore.setValue(['transient', globId, 'status'], prevStatus);
	})
	.then(() => {
		DataStore.setValue(['transient', globId, 'status'], C.STATUS.clean);
	});
};

export default ActionMan;
