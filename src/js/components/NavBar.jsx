import React from 'react';
import Login from 'you-again';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Navbar, NavbarBrand } from 'reactstrap';
import NavBar from '../base/components/NavBar';
import C from '../C';
import {navBarLogoContainerSVG} from './svg';
import {LoginLink} from '../base/components/LoginWidget';

const MyLoopNavBar = props => {
	const toggleColor = props.backgroundColor === 'transparent' ? '#770f00' : '#fff';

	return (
		<Navbar color={props.backgroundColor}>
			{navBarLogoContainerSVG}
			<NavbarBrand href="/" className="mr-auto">
				<img src={props.logo || C.app.homeLogo || C.app.logo } />
			</NavbarBrand>
			<AccountMenu active={props.currentPage === 'account'} logoutLink='#my' toggleColor={toggleColor} />
		</Navbar>
	);
};

const AccountMenu = ({active, logoutLink, toggleColor}) => {
	if (!Login.isLoggedIn()) { 
		return (
			<ul id='top-right-menu' className="nav navbar-nav navbar-right">
				<li><LoginLink /></li>
			</ul>
		); 
	}

	let user = Login.getUser();

	return (
		<UncontrolledDropdown className="navbar-right">
			<DropdownToggle caret style={{backgroundColor: 'transparent', border: '0', color:toggleColor}}>
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
