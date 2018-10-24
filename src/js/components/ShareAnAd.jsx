import React from 'react';
import DataStore from '../base/plumbing/DataStore';
import TwitterShare from './TwitterShare';

class ShareAnAd extends React.Component {
	constructor(props) {
		super(props);

		// Create ref by callback https://reactjs.org/docs/refs-and-the-dom.html#callback-refs
		
		// Don't need to declare these, but vaguely helpful to see what's used
		this.adunitRef = null;

		this.setRef = (ref, value) => {
			this[ref] = value;
		};

		this.focusRef = (ref) => {
			if (this[ref]) this[ref].focus();
		};

		// ID of Good-loop ad to be shown
		// Imagining that we will sometimes have set this based on user's ad history
		this.state = {
			adID: DataStore.getValue(['widget', 'TwitterShare', 'adID'])
		};
	}

	// Would usually prefer to put this sort of thing in to componentWillMount
	// but lifecycle goes willMount -> render -> didMount, and this.adunitRef
	// needs to be a valid reference for us to put the iframe into
	componentDidMount() { 
		this.focusRef('adunitRef'); 

		const {adID} = this.state;

		const iframe = document.createElement('iframe');

		/** Elements to place in Good-Loop iframe */
		const $script = document.createElement('script');
		$script.setAttribute('src', adID ? '//as.good-loop.com/unit.js?gl.vert=' + adID : '//as.good-loop.com/unit.js');

		const $div = document.createElement('div');
		$div.setAttribute('class', 'goodloopad');


		iframe.setAttribute('id', 'good-loop-iframe');

		iframe.style.height = '250px';
		iframe.style.width = '300px';

		iframe.addEventListener('load', () => {
			window.iframe = iframe;
			iframe.contentDocument.body.style.overflow = 'hidden';
			iframe.contentDocument.body.appendChild($script);
			iframe.contentDocument.body.appendChild($div);
		});
		/** */
		this.adunitRef.appendChild(iframe);

		if( !adID ) {
			// No ad ID provided
			// Going to load the adunit, let it pick an ad,
			// then pull the relevant ad ID out of the iframe

			const adIDPV = new Promise( (resolve, reject) => {
				$script.addEventListener('load', () => {
					resolve(iframe.contentWindow);
				});

				$script.addEventListener('error', () => {
					reject(false);
				});

				iframe.addEventListener('error', () => {
					reject(false);
				});
			});

			// Grab ad ID chosen by adunit and place in to DataStore/state
			adIDPV.then( contentWindow => { 
				// Assuming that adunit has not embedded itself in another iframe
				const {goodloop} = contentWindow;
				const id = goodloop.vert.adid; 

				DataStore.setValue(['widget', 'TwitterShare', 'adID'], id);
				this.setState({adID: id}); 
			});
		}     
	} 

	render() {
		const {adID} = this.state;

		return (
			<div className="ShareAd">
				<h2> Share this ad on social media </h2>
				<div ref={e => this.setRef('adunitRef', e)} />
				<TwitterShare adID={this.state.adID} />
			</div>
		);
	}
}

module.exports = ShareAnAd;
