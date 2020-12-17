
import React from 'react';
import {Card} from './CardEditorPage';

// import { useHowl, Play } from 'rehowl'

const CardPage = () => {
	let aimg = DataStore.getUrlValue("aimg");
	let bimg = DataStore.getUrlValue("bimg");
	let bg = '/img/card/snow-scene-w-transparency.png' // TODO mobile

	let ax = DataStore.getUrlValue("ax") || '20%';
	let ay = DataStore.getUrlValue("ay") || 50;
	let aw = DataStore.getUrlValue("aw") || 30;
	let aflip = DataStore.getUrlValue("aflip");
	let bx = DataStore.getUrlValue("bx") || '70%';
	let by = DataStore.getUrlValue("by") || 50;
	let bw = DataStore.getUrlValue("bw") || 30;
	let bflip = DataStore.getUrlValue("bflip");

	return (<div className='avoid-navbar position-relative'>
		<Card bg={bg} {...{ax,ay,aw,aimg,aflip,bx,by,bw,bimg,bflip}} zIndex={100} flakes />		
	</div>);
};

export default CardPage;
