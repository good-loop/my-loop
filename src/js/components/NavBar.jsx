import React from 'react';
import AccountMenu from '../base/components/AccountMenu';
import OptimisedImage from './Image';
import { LoginLink } from '../base/components/LoginWidget';

const NavBar = ({brandLogo}) => {
	let glLogo = 'https://as.good-loop.com/uploads/marvinirinapreda.meemail/logo-white2-1935363258088848027.png';
	const loginInfo = Login.isLoggedIn() ? (
		<div className="pull-right logged-in">
			{/* <p>Hi { Login.getUser().name || Login.getUser().xid }</p>
			<small className="pull-right">
				<a className="logout-link" href="#my" onClick={e => stopEvent(e) && Login.logout()}>Log out</a>
			</small> */}
			<AccountMenu account={false} logoutLink={'#'} />
		</div>
	) : (
		<div id='top-right-menu' className="pull-right">
			<LoginLink className='btn btn-lg btn-default btn-gl discrete-login' verb='Login' />		
		</div>
	);

	// TODO: Refactor campaign-page specific code out of here
	// Need to adjust layout to fit three elements if a brandLogo is provided
	const colLength = brandLogo ? 4 : 6;

	return (
		<div className="nav-bar container-fluid">
			<div className='row flex-row'>
				<div className={`col-md-${colLength} col-xs-${colLength} flex-vertical-align flex-align-items-start`}>
					<div className="header-logos">
						<a href="#my">
							<img className="gl-logo" alt='Good-Loop Logo' src={glLogo} />
						</a>
					</div>		
				</div>
				{
					brandLogo
					&&
					<div className='col-md-4 col-xs-4'>
						<OptimisedImage 
							alt='Sponsor Logo'
							render={ props => <img {...props} /> } 
							src={brandLogo} 
							className='gl-logo'
							style={{ display: brandLogo ? 'inline-block' : 'none' }} 
						/>
					</div>
				}
				<div className={`col-md-${colLength} col-xs-${colLength}`}>
					{ loginInfo }	
				</div>
			</div>
		</div>
	);
};

export default NavBar;
