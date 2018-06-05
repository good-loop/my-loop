import React from 'react';
import ReactDOM from 'react-dom';

import SJTest from 'sjtest';
const assert = SJTest.assert;
import printer from '../base/utils/printer.js';
import C from '../C.js';
import Login from 'you-again';
import Roles from '../base/Roles';
import Misc from '../base/components/Misc';

const JoinUsPage = () => {

	if ( ! Login.isLoggedIn()) {
		return (
			<div className=''>
				<h2>Join Us!</h2>
				<h3>Contact Amy or Dan to join the Good-Loop movement.</h3>
				<p>
					Already involved? Please login.
				</p>
				<img src='http://www.teara.govt.nz/files/p1125atl.jpg' />
			</div>
		);
	}
		
	if (Roles.iCan('admin').value === undefined) {
		return (
			<div className=''>
				<Misc.Loading />
			</div>
		);
	}

	if (Roles.iCan('admin').value) {
		return (
			<div className=''>
				<h2>Joining Us: Account Authorised :)</h2>
				<h3>Great you've registered and you're authorised! You're good to go :)</h3>
				<img src='http://www.teara.govt.nz/files/p1125atl.jpg' />
			</div>
		);
	}

	return (
		<div className=''>
			<h2>Joining Us: Account Authorisation</h2>
			<h3>Great you've registered! Contact Amy or Dan to get your account authorised.</h3>
			<img src='http://www.teara.govt.nz/files/p1125atl.jpg' />
		</div>
	);

};// ./JoinUsPage

export default JoinUsPage;
