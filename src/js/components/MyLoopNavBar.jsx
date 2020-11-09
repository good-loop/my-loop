import React from 'react';
import Login from 'you-again';
import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { LoginLink } from '../base/components/LoginWidget';
// import NavBar from '../base/components/NavBar';
import C from '../C';
import { space } from '../base/utils/miscutils';

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
		this.toggle = this.toggle.bind(this);
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
		// Optionally uses colour overrides for styling on scroll and default
		const style = {background:this.state.scrolled ? (this.props.scrollColour ? this.props.scrollColour : "") : (this.props.normalColour ? this.props.normalColour : ""), ...this.props.style};
		if (this.state.scrolled) Object.assign(style, this.props.scrollStyle);
		return (
			<Navbar className={this.state.scrolled ? "scrolled" : ""}
				style={style}
				sticky='top' expand='lg'>
				<NavbarBrand href="/#my" className="mr-auto">
					<img src={this.state.scrolled && logoScrollSrc ? logoScrollSrc : logoSrc} alt='logo' className='logo-small' />
				</NavbarBrand>
				
				<NavbarToggler onClick={this.toggle}>
					<img src="/img/Icon_Hamburger.200w.png" className="navbar-toggler-icon"/>
				</NavbarToggler>
				<Collapse isOpen={this.state.open} navbar className="gl-bootstrap-navbar" id="navItemsDiv" style={{flexGrow:0, flexBasis:"60%"}}>
					<Nav navbar className="navbar-nav w-100 justify-content-between">
						<NavItem>
							<NavLink href="/#howitworks">How it works</NavLink>
						</NavItem>
						<NavItem>
							<NavLink href="/#ads">Ad campaigns</NavLink>
						</NavItem>
						<NavItem>
							<NavLink href="/#charities">Charities</NavLink>
						</NavItem>
						<NavItem>
							<NavLink href="/#involve">Get Involved</NavLink>
						</NavItem>
						<NavItem>
							<AccountMenu />
						</NavItem>
					</Nav>
				</Collapse>
			</Navbar>
		);
	}
}

const AccountMenu = ({logoutLink, children}) => {
	if (!Login.isLoggedIn()) { 
		return (
			<LoginLink verb="register" className="login-menu btn btn-transparent fill">Register / Log in</LoginLink>
		); 
	}

	let user = Login.getUser();

	return (
		<UncontrolledDropdown className="account-menu">
			<DropdownToggle caret style={{backgroundColor: 'transparent', border: '0'}} className="login-link btn btn-transparent fill">
				{ user.name || user.xid }&nbsp;
			</DropdownToggle>
			<DropdownMenu right>
				<DropdownItem href="/#account">Account</DropdownItem>
				{children ? <DropdownItem divider /> : null}
				{children}
				<DropdownItem divider />
				<DropdownItem href={logoutLink} onClick={() => Login.logout()}>Log out</DropdownItem>
			</DropdownMenu>
		</UncontrolledDropdown>
	);
};

export { AccountMenu };
export default MyLoopNavBar;
