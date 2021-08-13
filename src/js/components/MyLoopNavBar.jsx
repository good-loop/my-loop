import React from 'react';
import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

import Login from '../base/youagain';
import { LoginLink } from '../base/components/LoginWidget';
// import NavBar from '../base/components/NavBar';
import C from '../C';
import { space } from '../base/utils/miscutils';

/**
 * TODO refactor to merge with NavBar.jsx
 * 
 * MyLoop Navbar has separate scroll functionality - could be moved into base if this is wanted across all our services
 */

/*
 * Navbar for all My-Loop pages
 * Expects a logo url and currentPage object
 * If logoScroll is set, logoScroll will be displayed in place of logo when the navbar is scrolled
 * If alwaysScrolled is set, the navbar will always display the scrolled version
 * neverScroll will disable scrolling changes to style
 * scrollColour overrides the colour to change to when scrolled
 * hidePages will mean only the logo and login are visible
 */
class MyLoopNavBar extends React.Component {

	constructor (props) {
		super(props);
		this.state = {scrolled: this.props.neverScroll ? false : (this.props.alwaysScrolled ? true : window.scrollY > 50), open: false};
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
		this.setState({scrolled: this.props.neverScroll ? false : (this.props.alwaysScrolled ? true : window.scrollY > 50)});
	}

	toggle () {
		this.setState({open: !this.state.open});
	}

	scrolltoHowitworks () {
		// Wait a moment for MyPage to get rendered so #howitworks-section exists
		window.setTimeout(() => {
			document.getElementById('howitworks-section').scrollIntoView({behavior: 'smooth'});
		}, 50);
	}

	render () {
		// ToDo: Move navbarToggleSrc outside if this component
		const navbarToggleSrc = "/img/Icon_Hamburger-black.png";
		const navbarToggleScrollSrc = "/img/Icon_Hamburger.200w.png";
		// Optionally uses colour overrides for styling on scroll and default
		const style = {background:this.state.scrolled ? (this.props.scrollColour ? this.props.scrollColour : "") : (this.props.normalColour ? this.props.normalColour : ""), ...this.props.style};
		if (this.state.scrolled) Object.assign(style, this.props.scrollStyle);

		// Merge state.scrolled and state.open into one navClass
		const isScrolled = this.state.scrolled || this.state.open;
		const navClass = isScrolled ? 'scrolled' : '';

		let navLogo = this.props.logo || C.app.homeLogo || C.app.logo; // defaults
		if (isScrolled) navLogo = this.props.logoScroll || navLogo; // fall back to non-scrolled if no special logo provided for scrolled state
		const toggleSrc = isScrolled ? navbarToggleScrollSrc : navbarToggleSrc;

		let {brandLink, brandLogo, brandName} = DataStore.getValue(['widget','NavBar']) || {}; // HACK copy in some of our std NavBar
		// isScrolled && ??Show only on scrolled to simplify logo colours vs backdrop
		const isShowBrandLogo = window.location.href.includes("#campaign") ? brandLink && (brandLogo || brandName) : undefined;

		return (
			<Navbar className={navClass}
				style={style}
				sticky="top" expand="xl">
				<NavbarBrand href="/#my" className={ ! isShowBrandLogo && "mr-auto"}>
					<img src={navLogo} alt="logo" className="logo-sm" />
				</NavbarBrand>
				{isShowBrandLogo && // a 2nd brand? 
					<NavbarBrand className="nav-brand mr-auto btn btn-transparent fill" title={brandName} href={brandLink}>
						{brandLogo? <img className='logo-sm' alt={brandName} src={brandLogo} /> : brandName}
					</NavbarBrand>
				}

				<NavbarToggler onClick={this.toggle}>
					<img src={toggleSrc} alt="toggler" className="navbar-toggler-icon" />
				</NavbarToggler>
				<Collapse isOpen={this.state.open} navbar className="gl-bootstrap-navbar" id="navItemsDiv" style={{flexGrow:0}}>
					<Nav navbar className={space("navbar-nav w-100", this.props.hidePages ? "justify-content-end" : "justify-content-between")}>
						{!this.props.hidePages && <>
							<NavItem>
								<NavLink onClick={this.scrolltoHowitworks} href="/#howitworks">How it works</NavLink>
							</NavItem>
							<NavItem>
								<NavLink href="/#ads">Ad campaigns</NavLink>
							</NavItem>
							<NavItem>
								<NavLink href="/#charities">Charities</NavLink>
							</NavItem>
							<NavItem>
								<NavLink href="/#involve">Get involved</NavLink>
							</NavItem>
						</>}
						<NavItem>
							<AccountMenu />
						</NavItem>
					</Nav>
				</Collapse>
			</Navbar>
		);
	}
}

/**
 * Account dropdown widget for account access and logout
 * @param logoutLink custom link to redirect to on logout
 * @param small display a small circle with initial instead of full name
 * @param accountLink custom link for account page
 * @param children enter extra DropdownItem components to add more entries to the menu here
 */
const AccountMenu = ({logoutLink, small, accountLink, customLogin, children}) => {
	if (!Login.isLoggedIn()) {
		return (
			customLogin || <LoginLink verb="register" className="login-menu btn btn-transparent fill">Get started</LoginLink>
		);
	}

	let user = Login.getUser();
	let name = user.name || user.xid;
	let initial = name.substr(0, 1);

	return (
		<UncontrolledDropdown className="account-menu">
			<DropdownToggle caret className={space("login-link", small ? "bg-gl-orange small-account text-white" : "btn btn-transparent fill")}>
				{small ? initial : name + " "}
			</DropdownToggle>
			<DropdownMenu right>
				<DropdownItem href={accountLink || "/#account"}>Account</DropdownItem>
				{children}
				<DropdownItem href={logoutLink} onClick={() => Login.logout()}>Log out</DropdownItem>
			</DropdownMenu>
		</UncontrolledDropdown>
	);
};

export { AccountMenu };
export default MyLoopNavBar;
