
import React from 'react';


const CardPage = () => {
	let aimg = DataStore.getUrlValue("aimg") || '/img/redgirl.png';
	let atrans = DataStore.getUrlValue("atrans") || '/img/redgirl.png';
	let bimg = DataStore.getUrlValue("bimg") || '';
	let bg = '/img/card/snowman-scene.png'
	return <div className='avoid-navbar position-relative'>

		<img src={aimg} className='position-absolute' style={{top:'20%',left:'20%',width:'30%'}} />
		<img src={bimg} className='position-absolute' />
		<img src={bg} style={{width:'100%', opacity:'50%'}} />

		<h2>With you in spirit</h2>
		<h1>Season's Greetings</h1>
	</div>;
};

export default CardPage;
