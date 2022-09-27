import React from 'react';

import Misc from './base/components/Misc';

// Override the loading spinner graphic with a Good-Loop one
Misc.spinnerSvg = (
	<svg xmlns="http://www.w3.org/2000/svg" className="arc-s" viewBox="0 0 100 100">
		<path fill="none" stroke="currentColor" strokeWidth="15px" d="M 50 0 a 50 50 0 1 1 -43.3 75" />
	</svg>
);

export default Misc;
