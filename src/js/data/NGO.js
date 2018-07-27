/** Data model functions for the NGO data-type. */
import {assert} from 'sjtest';

import {defineType} from '../base/data/DataClass';
import C from '../C';

const NGO = defineType(C.TYPES.NGO);
export default NGO;

NGO.description = (ngo) => NGO.isa(ngo) && ngo.description;

