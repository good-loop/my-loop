
import {assert, assMatch} from 'sjtest';
import Login from 'you-again';
import PV from 'promise-value';

import C from '../C';

import ServerIO from './ServerIO';
import DataStore from '../base/plumbing/DataStore';
import {getId, getType} from '../base/data/DataClass';

import ActionMan from '../base/plumbing/ActionManBase';
export default ActionMan;

/**
 * 
 * @param {String} xid Can be null
 * @returns {PV(Person)} 
 */
ActionMan.getProfile = ({xid}) => {
	if ( ! xid) {
		return PV({});
	}
	let path = DataStore.getPath(C.KStatus.PUBLISHED, C.TYPES.Person, xid);
	return DataStore.fetch(path, () => {
		return ServerIO.getProfile({xid});
	});
};
