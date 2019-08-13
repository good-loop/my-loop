import React from 'react';
import NavBar from '../base/components/NavBar';
import C from '../C';
import {navBarLogoContainerSVG} from './svg';

const MyLoopNavBar = props => (
	<div>
		<NavBar
			{...props}
			pages={[]}
			render={({pageLinks, currentPage, style, logo}) => (
				<>
					{navBarLogoContainerSVG}
					<div style={style}>
						<div className="navbar-header" title="Dashboard">
							<button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
								<span className="sr-only">Toggle navigation</span>
								<span className="icon-bar" /><span className="icon-bar" /><span className="icon-bar" />
							</button>
							<a className="navbar-brand" href='/'>
								<img alt={C.app.name} src={logo || C.app.homeLogo || C.app.logo} />
							</a>
						</div>
						<div id="navbar" className="navbar-collapse collapse">
							<ul className="nav navbar-nav">
								{pageLinks}
							</ul>
							<div>
								<AccountMenu active={currentPage === 'account'} logoutLink='#my' />
							</div>
						</div>
					</div>
				</>
			)}
		/>
	</div>
);

const AccountMenu = ({active, logoutLink}) => {
	const isMobile = window.innerWidth <= 767;
	
	// TODO see navbar dropdown
	if ( ! Login.isLoggedIn()) {
		return (
			<ul id='top-right-menu' className="nav navbar-nav navbar-right">
				{props.noRegister ? '' : <li><RegisterLink /></li>}
				<li><LoginLink /></li>
			</ul>
		);
	}

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
					<li><a href={logoutLink} onClick={() => doLogout()}>Log out</a></li>
				</ul>
			</li>
		</ul>
	);
};


export default MyLoopNavBar;
