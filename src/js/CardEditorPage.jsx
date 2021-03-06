
import React, { useState } from 'react';
import { Button } from 'reactstrap';
import CSS from './base/components/CSS';
import { Draggable, DropZone } from './base/components/DragDrop';
import Editor3ColLayout, { LeftSidebar, MainPane, RightSidebar } from './base/components/Editor3ColLayout';
import LinkOut from './base/components/LinkOut';
import PropControl from './base/components/PropControl';
import { Tab, Tabs } from './base/components/Tabs';
import DataStore from './base/plumbing/DataStore';
import { encURI, modifyHash } from './base/utils/miscutils';


// FB img http://graph.facebook.com/67563683055/picture?type=square
//https://developers.facebook.com/docs/graph-api/reference/v2.2/user/picture

// LinkedIn would need oauth by the user

// Twitter??

const CardEditorPage = () => {

	let aimg = DataStore.getUrlValue("aimg");
	let bimg = DataStore.getUrlValue("bimg");
	let bg = '/img/card/snow-scene-w-transparency.png' // TODO mobile

	let ax = DataStore.getUrlValue("ax") || 10;
	let ay = DataStore.getUrlValue("ay") || 20;
	let aw = DataStore.getUrlValue("aw") || 20;
	let aflip = DataStore.getUrlValue("aflip");

	let bx = DataStore.getUrlValue("bx") || 70;
	let by = DataStore.getUrlValue("by") || 20;
	let bw = DataStore.getUrlValue("bw") || 20;
	let bflip = DataStore.getUrlValue("bflip");

	const onDrop = (e, dropInfo) => {
		let did = dropInfo.draggable;
		console.warn(dropInfo, did, e);
		const prefix = did[did.length - 1];
		DataStore.setUrlValue(prefix + "x", Math.round(100 * dropInfo.zoneX / dropInfo.zoneWidth));
		DataStore.setUrlValue(prefix + "y", Math.round(100 * dropInfo.zoneY / dropInfo.zoneHeight));
	};

	let from = DataStore.getUrlValue("from");
	let to = DataStore.getUrlValue("to");
	let link = ("" + window.location).replace("#cardeditor", "#card");

	return (<div className='avoid-navbar'>

		<Editor3ColLayout showAll >
			<MainPane>
				<Tabs>
					<Tab tabId='editor' title="Edit" >
						<DropZone className='position-relative' id='the-scene' onDrop={onDrop} style={{ border: "none" }}>

							<FacePic prefix='a' x={ax} y={ay} w={aw} img={aimg} />
							<FacePic prefix='b' x={bx} y={by} w={bw} img={bimg} />

							<Card bg={bg} zIndex={5} />

						</DropZone>
					</Tab>
					<Tab tabId='preview' title="Preview" >
						<div className='position-relative' id='the-scene' onDrop={onDrop}>
							<Card bg={bg} {...{ ax, ay, aw, aimg, aflip, bx, by, bw, bimg, bflip }} zIndex={100} flakes />
						</div>
					</Tab>
				</Tabs>
			</MainPane>
			<RightSidebar>
				<div>
					<PropControl label="To (name)" prop='to' />
					<PropControl label="Message" dflt='With you in spirit' prop='msg' />
					<PropControl label="From (your name)" prop='from' />

					<LinkOut className='btn btn-primary' href={"mailto:?SUBJECT=" + encURI(
						"Season's Greetings from " + from + " and Good-Loop"
					) + "&BODY=" + encURI(
						`Dear ${to},\n\nSeason's Greetings! I'm sending you an e-card with a charity donation.\n\n💌✉️ Click here to open your card:\n${link}.\n\nBest wishes,\n${from}\n`
					)}
						title='Opens your email editor'>Send...</LinkOut>
					<div><small><a href={link} target='_new'>the link</a></small></div>
				</div>
			</RightSidebar>
		</Editor3ColLayout>
	</div>);
};

const FacePic = ({ prefix, img, x, y, w }) => {
	let flip = DataStore.getUrlValue(prefix + "flip");
	//  ◭ ⏃ 
	// NB: use %s instead of px for responsive layout
	// NB: controls have fixed width 'cos otherwise they'd resize during resizing!
	return (<>
		<Draggable id={'drag-' + prefix} style={{ position: 'absolute', zIndex: 10, border: "dotted 1px black", opacity: '50%', top: y + '%', left: x + '%', width: w + '%' }}>
			{img ? <img src={img} style={{ width: '100%', transform: flip ? "scaleX(-1)" : null }} /> : <PropControl type='imgUpload' prop={prefix + 'img'} version="mobile" />}
		</Draggable>
		<div className='flex-row' style={{ position: 'absolute', zIndex: 10, top: y + '%', marginTop: "-1.2em", left: x + '%', width: '150px' }}>
			<Button title='Flip photo left-right' color='secondary' size='xs' onClick={e => DataStore.setUrlValue(prefix + 'flip', !flip)} disabled={!img}>▶◁</Button>
			<PropControl prop={prefix + 'w'} type="range" step="0.01" min="10" max="80" name={prefix + "w"} value="30" />
			<Button title='Remove photo' color='secondary' size='xs' onClick={e => DataStore.setUrlValue(prefix + 'img', null)} disabled={!img} >🗑</Button>
		</div>
	</>);
};

const Card = ({ bg, ax, ay, aw, aimg, aflip, bx, by, bw, bimg, bflip, zIndex, flakes }) => {
	let from = DataStore.getUrlValue("from");
	let to = DataStore.getUrlValue("to");
	let msg = DataStore.getUrlValue("msg");

	// make flakes?
	let [flakeInfos] = useState([]);
	if (flakes && !flakeInfos.length) {
		for (let i = 0; i < 20; i++) {
			let w = (2 + Math.random() * 3);
			flakeInfos.push({
				left: (i * 5) + "%",
				width: w + "%",
				animationDuration: (30 / w) + "s",
				animationDelay: (Math.random() * 10) + "s"
			});
		}
	}

	return (<>
		<CSS css={`
		.the-card {
			overflow:hidden;
			width:100%;
			position:relative;
		}
		.the-card h1 {
			margin:auto;
			text-align:center;
			color:white;
			text-shadow: 2px 2px 2px #333;
		}
		@keyframes fall {
			from {top: -5%; transform: rotate(0deg); }
			to {top: 100%; transform: rotate(360deg);}
		}
		.flake {
			position:absolute;
			z-index:${zIndex + 10};
			top:-6%;
			animation-name: fall;  	
			animation-iteration-count: infinite;		
		}
	`} />
		{aimg && <img src={aimg} style={{ position: 'absolute', top: ay + '%', left: ax + '%', width: aw + '%', transform: aflip ? "scaleX(-1)" : null, zIndex }} draggable={false} />}
		{bimg && <img src={bimg} style={{ position: 'absolute', top: by + '%', left: bx + '%', width: bw + '%', transform: bflip ? "scaleX(-1)" : null, zIndex }} draggable={false} />}
		<div className='the-card'>
			<div style={{ position: 'absolute', top: '2%', left: 0, right: 0, zIndex: zIndex + 2 }}>
				<h1>To {to}</h1>
				<h1>{msg}</h1>
				<h1>From {from}</h1>
			</div>

			<img src={bg} style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: zIndex + 1 }} draggable={false} />
			<img src={bg} draggable={false} style={{ width: '100%' }} /> {/* 2nd copy is for sizing height */}
			{flakes && flakeInfos.map((flakeInfo, i) => <img key={i} className='flake' src='/img/card/covidsnowflake.png' style={flakeInfo} />)}
		</div>
		<p>
			This e-card by Good-Loop is raising money for Centrepoint and Trees for the Future. For each card, we make a 10p donation to both charities.
	Thank you for opening it. You can also send it on if you want using this <a href={modifyHash(['cardeditor'], { to: '', from: to }, true)}>card editor</a>.
	</p>
	</>);
};

export default CardEditorPage;
export {
	Card
}
