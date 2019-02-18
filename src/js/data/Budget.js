/** Data model functions for the Budget data-type. */
import {assert} from 'sjtest';

import DataClass from '../base/data/DataClass';
import C from '../C';
import Money from '../base/data/Money';


class Budget extends DataClass {
	total= new Money();
	spent= new Money();
	/** @type {!String} */
	id;

	constructor(base) {
		Object.assign(this, base);
		this['@type'] = 'Budget';
			// Is this budget connected to an ad? Make sure its ID is correct
		if (this.adid) {
			if ( ! this.id) this.id = id(this);
			assert(this.id === id(this), this);
		}
	}

}
DataClass.register(Budget, "Budget");


const id = item => `budget_${item.adid}`;

export default Budget;
