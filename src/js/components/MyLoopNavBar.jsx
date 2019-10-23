import React from 'react';
import Login from 'you-again';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Navbar, NavbarBrand } from 'reactstrap';
// import NavBar from '../base/components/NavBar';
import C from '../C';
import {navBarLogoContainerSVG} from './svg';
import {LoginLink} from '../base/components/LoginWidget';

/**
 * Why do we need our own jsx??
 */

const MyLoopNavBar = ({backgroundColor, logo, currentPage}) => {
	// red on transparent, white if on colour
	// const toggleColor = backgroundColor === 'transparent' ? '#770f00' : '#fff';
	// The red gets lost in our other elements easily and is difficult to give a good-looking contrast shadow, trying white for all cases
	const toggleColor = '#fff';
	
	return (
		<Navbar color={backgroundColor} fixed='top'>
			{navBarLogoContainerSVG}
			<NavbarBrand href="/" className="mr-auto">
				<img src={logo || C.app.homeLogo || C.app.logo} alt='logo' className='logo-small' />
			</NavbarBrand>
			<AccountMenu active={currentPage === 'account'} logoutLink='#my' toggleColor={toggleColor} />
		</Navbar>
	);
};

const AccountMenu = ({active, logoutLink, toggleColor}) => {
	if ( ! Login.isLoggedIn()) { 
		return (
			<ul id='top-right-menu' className="nav navbar-nav navbar-right">
				<li><LoginLink /></li>
			</ul>
		); 
	}

	let user = Login.getUser();

	return (
		<UncontrolledDropdown className="navbar-right">
			<DropdownToggle caret style={{backgroundColor: 'transparent', border: '0', color: toggleColor}}>
				{ user.name || user.xid }&nbsp;
			</DropdownToggle>
			<DropdownMenu right>
				<DropdownItem href="#account">Account</DropdownItem>
				<DropdownItem divider />
				<DropdownItem href={logoutLink} onClick={() => Login.logout()}>Log out</DropdownItem>
			</DropdownMenu>
		</UncontrolledDropdown>
	);
};

export default MyLoopNavBar;
