/** Data model functions for the Budget data-type. */
import {assert} from 'sjtest';

import {isa} from '../base/data/DataClass';
import C from '../C';
import Money from '../base/data/Money';


const Budget = {};

Budget.isa = budget => isa(budget, C.TYPES.Budget);
Budget.assIsa = budget => assert(Budget.isa(budget));

const id = item => `budget_${item.adid}`;

Budget.make = base => {
	const item = {
		total: Money.make(), // default
		spent: Money.make(), // default
		...base, // Base comes after defaults so it overrides
		'@type': C.TYPES.Budget, // @type always last so it overrides erroneous base.type
	};

	// Is this budget connected to an ad? Make sure its ID is correct
	if (item.adid) {
		if (!item.id) item.id = id(item);
		assert(item.id === id(item), item);
	}
	return item;
};

export default Budget;
