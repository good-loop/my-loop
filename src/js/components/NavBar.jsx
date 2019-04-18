import React from 'react';
import NavBar from '../base/components/NavBar';
import AccountMenu from '../base/components/AccountMenu';
import C from '../C';

//TODO: Examine why we are using this instead of the base NavBar component
// const NavBar = ({brandLogo}) => {
// 	let glLogo = '/img/GoodLoopLogos_Good-Loop_AltLogo_White_Resized.png';
// 	const loginInfo = Login.isLoggedIn() ? (
// 		<div className="pull-right logged-in">
// 			{/* <p>Hi { Login.getUser().name || Login.getUser().xid }</p>
// 			<small className="pull-right">
// 				<a className="logout-link" href="#my" onClick={e => stopEvent(e) && Login.logout()}>Log out</a>
// 			</small> */}
// 			<AccountMenu account={false} logoutLink={'#'} />
// 		</div>
// 	) : (
// 		<div id='top-right-menu' className="pull-right">
// 			<LoginLink className='btn btn-lg btn-default btn-gl discrete-login' verb='Login' />		
// 		</div>
// 	);

// 	// TODO: Refactor campaign-page specific code out of here
// 	// Need to adjust layout to fit three elements if a brandLogo is provided
// 	const colLength = brandLogo ? 4 : 6;

// 	return (
// 		<div className="nav-bar container-fluid white background-gl-red">
// 			<div className='row flex-row'>
// 				<div className={`col-md-${colLength} col-xs-${colLength} flex-vertical-align flex-align-items-start`}>
// 					<div className="header-logos">
// 						<a href="#my">
// 							<img className="gl-logo" alt='Good-Loop Logo' src={glLogo} />
// 						</a>
// 					</div>		
// 				</div>
// 				{
// 					brandLogo
// 					&&
// 					<div className='col-md-4 col-xs-4'>
// 						<OptimisedImage 
// 							alt='Sponsor Logo'
// 							render={ props => <img {...props} /> } 
// 							src={brandLogo} 
// 							className='gl-logo'
// 							style={{ display: brandLogo ? 'inline-block' : 'none' }} 
// 						/>
// 					</div>
// 				}
// 				<div className={`col-md-${colLength} col-xs-${colLength}`}>
// 					{ loginInfo }	
// 				</div>
// 			</div>
// 		</div>
// 	);
// };

const Contents = ({pageLinks, currentPage}) => (
	<div className='container-fluid'>
		<div className="navbar-header" title="Dashboard">
			<button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
				<span className="sr-only">Toggle navigation</span>
				<span className="icon-bar" /><span className="icon-bar" /><span className="icon-bar" />
			</button>
			<a className="navbar-brand" href='/'>
				<img alt={C.app.name} src={C.app.homeLogo || C.app.logo} />
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
);

const MyLoopNavBar = () => <NavBar pages={[]} render={Contents} />;	

export default MyLoopNavBar;
