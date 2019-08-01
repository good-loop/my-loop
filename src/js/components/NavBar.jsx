import React from 'react';
import NavBar from '../base/components/NavBar';
import AccountMenu from '../base/components/AccountMenu';
import C from '../C';
import {navBarLogoContainerSVG} from './svg';

const Contents = ({pageLinks, currentPage, style, logo}) => (
	<div className='container-fluid' style={style}>
		<div className="navbar-header" title="Dashboard">
			<button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
				<span className="sr-only">Toggle navigation</span>
				<span className="icon-bar" /><span className="icon-bar" /><span className="icon-bar" />
			</button>
			<a className="navbar-brand" href='/'>
				<img alt={C.app.name} src={logo || C.app.homeLogo || C.app.logo} />
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

const MyLoopNavBar = props => <NavBar {...props} pages={[]} render={Contents} />;

const RedesignNavBar = props => (
	<div>
		<NavBar
			{...props}
			pages={[]}
			render={({pageLinks, currentPage, style, logo}) => (
				<>
					{navBarLogoContainerSVG}
					<div style={style}>
						<div className="navbar-header" title="Dashboard">
							<button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
								<span className="sr-only">Toggle navigation</span>
								<span className="icon-bar" /><span className="icon-bar" /><span className="icon-bar" />
							</button>
							<a className="navbar-brand" href='/'>
								<img alt={C.app.name} src={logo || C.app.homeLogo || C.app.logo} />
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
				</>
			)} 
		/>
	</div>
);


export default MyLoopNavBar;
export {
	MyLoopNavBar,
	RedesignNavBar
};
