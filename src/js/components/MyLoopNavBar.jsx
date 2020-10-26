import React from 'react';
import Login from 'you-again';
import { Container, Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
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
  * If alwaysScrolled is set, the navbar will always display the scrolled version
  */
class MyLoopNavBar extends React.Component {

	constructor (props) {
		super(props);
		this.state = {scrolled: this.props.alwaysScrolled ? true : window.scrollY > 50, open: false};
		this.handleScroll = this.handleScroll.bind(this);
	}

	componentDidMount () {
		window.addEventListener('scroll', this.handleScroll);
	}
	
	componentWillUnmount () {
		window.removeEventListener('scroll', this.handleScroll);
	}

	handleScroll () {
		this.setState({scrolled: this.props.alwaysScrolled ? true : window.scrollY > 50});
	}

	toggle () {
		this.setState({open: !this.state.open});
	}

	render () {
		// Provide fallbacks for logo
		const logoSrc = this.props.logo || C.app.homeLogo || C.app.logo;
		// logoScroll's fallback is logo
		const logoScrollSrc = this.props.logoScroll;
		
		return (
			<Navbar className={this.state.scrolled ? "scrolled" : ""} sticky='top' expand='lg'>
				<NavbarBrand href="/" className="mr-auto">
					<img src={this.state.scrolled && logoScrollSrc ? logoScrollSrc : logoSrc} alt='logo' className='logo-small' />
				</NavbarBrand>
				
				<NavbarToggler onClick={this.toggle}>
					<img src="/img/Icon_Hamburger.png" className="navbar-toggler-icon"/>
				</NavbarToggler>
				<Collapse isOpen={this.props.open} navbar className="gl-bootstrap-navbar" id="navItemsDiv" style={{flexGrow:0, flexBasis:"40%"}}>
					<Nav navbar className="navbar-nav w-100 justify-content-between">
						<NavItem>
							<NavLink href="/#my?scroll">How it works</NavLink>
						</NavItem>
						<NavItem>
							<NavLink href="https://www.good-loop.com/products.html">Ad campaigns</NavLink>
						</NavItem>
						<NavItem>
							<NavLink href="/#charities">Charities</NavLink>
						</NavItem>
						<NavItem>
							<NavLink className="btn btn-transparent fill" href="https://www.good-loop.com/contact.html">Get Involved</NavLink>
						</NavItem>
					</Nav>
				</Collapse>
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
