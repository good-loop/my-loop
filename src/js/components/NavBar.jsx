import React from 'react';
import NavBar from '../base/components/NavBar';
import AccountMenu from '../base/components/AccountMenu';
import C from '../C';

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
				<AccountMenu active={currentPage === 'account'} logoutLink='#my' isMobile={window.innerWidth <= 767} />
			</div>
		</div>
	</div>
);

const MyLoopNavBar = () => <NavBar pages={[]} render={Contents} />;	

export default MyLoopNavBar;
