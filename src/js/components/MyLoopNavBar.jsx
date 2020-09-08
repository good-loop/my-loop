import React from 'react';
import Login from 'you-again';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Navbar, NavbarBrand } from 'reactstrap';
// import NavBar from '../base/components/NavBar';
import C from '../C';
import {LoginLink} from '../base/components/LoginWidget';

/**
 * Why do we need our own jsx??
 * MyLoop Navbar now has separate scroll functionality - could be moved into base if this is wanted across all our services
 */

  /*
  * Navbar for all My-Loop pages
  * Expects a logo url and currentPage object
  * If logoScroll is set, logoScroll will be displayed in place of logo when the navbar is scrolled
  */
class MyLoopNavBar extends React.Component{

	constructor (props) {
		super(props);
		this.state = {scrolled: window.scrollY > 50}
		this.handleScroll = this.handleScroll.bind(this);
	}

	componentDidMount () {
		window.addEventListener('scroll', this.handleScroll);
	}
	
	componentWillUnmount () {
		window.removeEventListener('scroll', this.handleScroll);
	}

	handleScroll () {
		this.setState ({scrolled: window.scrollY > 50});
	}

	render () {
		// Provide fallbacks for logo
		const logoSrc = this.props.logo || C.app.homeLogo || C.app.logo;
		// logoScroll's fallback is logo
		const logoScrollSrc = this.props.logoScroll;

		return (
			<Navbar className={this.state.scrolled ? "scrolled" : ""} sticky='top'>
				<NavbarBrand href="/" className="mr-auto">
					<img src={this.state.scrolled && logoScrollSrc ? logoScrollSrc : logoSrc} alt='logo' className='logo-small' />
				</NavbarBrand>
				<AccountMenu active={this.props.currentPage === 'account'} logoutLink='#my' />
			</Navbar>
		);
	}
}

const AccountMenu = ({active, logoutLink}) => {
	if (!Login.isLoggedIn()) { 
		return (
			<ul id='top-right-menu' className="nav navbar-nav navbar-right">
				<li className="login-link"><LoginLink>Register / Log in</LoginLink></li>
			</ul>
		); 
	}

	let user = Login.getUser();

	return (
		<UncontrolledDropdown className="navbar-right">
			<DropdownToggle caret style={{backgroundColor: 'transparent', border: '0'}} className="login-link">
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
