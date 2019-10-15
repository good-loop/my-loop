import React from 'react';
import Login from 'you-again';

import NavBar from '../base/components/NavBar';
import C from '../C';
import {navBarLogoContainerSVG} from './svg';
import {LoginLink} from '../base/components/LoginWidget';


const MyLoopNavBar = props => (
	<NavBar
		{...props}
		pages={[]}
		render={({pageLinks, currentPage, style, logo}) => <>
			{navBarLogoContainerSVG}
			<div style={style} className="navbar-items">
				<div className="navbar-header" title="Dashboard">
					<a className="navbar-brand" href='/'>
						<img alt={C.app.name} src={logo || C.app.homeLogo || C.app.logo} />
					</a>
				</div>
				<div id="navbar" className="navbar-collapse collapse">
					<AccountMenu active={currentPage === 'account'} logoutLink='#my' />
				</div>
			</div>
		</>}
	/>
);

const AccountMenu = ({active, logoutLink}) => {
	if (!Login.isLoggedIn()) return (
		<ul id='top-right-menu' className="nav navbar-nav navbar-right">
			<li><LoginLink /></li>
		</ul>
	);

	let user = Login.getUser();

	return (
		<ul id='top-right-menu' className="nav navbar-nav navbar-right">
			<li className={'dropdown' + (active? ' active' : '')}>
				<a className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
					{ user.name || user.xid }&nbsp;
					<span className="caret" />
				</a>
				<ul className="dropdown-menu">
					<li><a href="#account">Account</a></li>
					<li role="separator" className="divider" />
					<li><a href={logoutLink} onClick={() => Login.logout()}>Log out</a></li>
				</ul>
			</li>
		</ul>
	);
};


export default MyLoopNavBar;
