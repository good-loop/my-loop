/** Data model functions for the Publisher data-type. */
import {assert} from 'sjtest';

import {isa} from './DataClass';
import C from '../C';

const {Publisher} = {};
export default Publisher;


Publisher.isa = publisher => isa(publisher, C.Types.Publisher);
Publisher.assIsa = publisher => assert(Publisher.isa(publisher));
Publisher.make = base => ({
	...base,
	'@type': C.TYPES.Publisher, // @type always last so it overrides erroneous base.type
});
