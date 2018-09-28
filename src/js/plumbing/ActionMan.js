import PV from 'promise-value';

import C from '../C';
import DataStore from '../base/plumbing/DataStore';
import {getProfile} from '../base/Profiler';
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
		return getProfile({xid});
	}, false); // no error message on 404 failure
};
