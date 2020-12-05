
import React from 'react';
import { Draggable, DropZone } from './base/components/DragDrop';
import PropControl from './base/components/PropControl';
import DataStore from './base/plumbing/DataStore';


// FB img http://graph.facebook.com/67563683055/picture?type=square
//https://developers.facebook.com/docs/graph-api/reference/v2.2/user/picture

// LinkedIn would need oauth by the user

// Twitter??

const CardEditorPage = () => {
	let aimg = DataStore.getUrlValue("aimg") || '/img/redgirl.png';	
	let bimg = DataStore.getUrlValue("bimg") || '';
	let bg = '/img/card/snowman-scene.png'
	let ax = DataStore.getUrlValue("ax") || '20%';
	let ay = DataStore.getUrlValue("ay") || '20%';
	const onDrop = (e,dropInfo) => {
		console.warn(dropInfo);
		DataStore.setUrlValue("ax", dropInfo.zoneX+'px');
		DataStore.setUrlValue("ay", dropInfo.zoneY+'px');
	};
	return <div className='avoid-navbar position-relative'>

		<DropZone onDrop={onDrop}>
		<img src={bg} style={{width:'100%'}} />

			<Draggable id='drag-imga' style={{position:'absolute', border:"dotted 1px black", opacity:'50%', top:ay,left:ax,width:'200px'}}>
				<img src={aimg} />
			</Draggable>

		</DropZone>

		<PropControl dflt='With you in spirit' prop='msg' />
		<h1>Season's Greetings</h1>
	</div>;
};

export default CardEditorPage;
