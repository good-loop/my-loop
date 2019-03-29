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
		<div className="pull-right">
			<LoginLink className='btn btn-lg btn-default btn-gl discrete-login' verb='Login' />		
		</div>
    );
    const content = brandLogo ? (
        <div className="nav-bar">
            <div className='nav-col-4'>
                <div className="header-logos pull-left">
                    <a href="#my"><img className="gl-logo" alt='Good-Loop Logo' src={glLogo}/></a>
                </div>		
            </div>
            <div className='nav-col-4'>
                <OptimisedImage 
                    alt='Sponsor Logo'
                    render={ props => <img {...props} />} 
                    src={brandLogo} 
                    className='vertiser-logo'
                    style={{ display: brandLogo ? 'inline-block' : 'none' }} 
			    />
            </div>
            <div className='nav-col-4'>
                { loginInfo }	
            </div>
        </div>
        ) : (
        <div className="nav-bar">
            <div className='nav-col-6'>
                <div className="header-logos pull-left">
                    <a href="#my"><img className="gl-logo" alt='Good-Loop Logo' src={glLogo}/></a>
                </div>		
            </div>
            <div className='nav-col-6'>
                { loginInfo }	
            </div>
        </div>);
	return (
        <div>
        { content }
        </div>
	);
};

export default NavBar;
