
import React from 'react';
import { Draggable, DropZone } from './base/components/DragDrop';
import PropControl from './base/components/PropControl';
import DataStore from './base/plumbing/DataStore';


// FB img http://graph.facebook.com/67563683055/picture?type=square
//https://developers.facebook.com/docs/graph-api/reference/v2.2/user/picture

// LinkedIn would need oauth by the user

// Twitter??

const CardEditorPage = () => {

// 	import AvatarEditor from 'react-avatar-editor';
// <AvatarEditor
// image={aimg}
// width={250}
// height={250}
// border={50}
// color={[255, 255, 255, 0.6]} // RGBA
// scale={1.2}
// rotate={0}
// />

	let aimg = DataStore.getUrlValue("aimg") || '/img/redgirl.png';	
	let bimg = DataStore.getUrlValue("bimg") || '';
	let bg = '/img/card/snowman-scene.png'
	let ax = DataStore.getUrlValue("ax") || '20%';
	let ay = DataStore.getUrlValue("ay") || '20%';
	let aw = DataStore.getUrlValue("aw") || 30;
	const onDrop = (e,dropInfo) => {
		console.warn(dropInfo);
		DataStore.setUrlValue("ax", dropInfo.zoneX+'px');
		DataStore.setUrlValue("ay", dropInfo.zoneY+'px');
	};
	return <div className='avoid-navbar position-relative'>

		<DropZone onDrop={onDrop}>
			<img src={bg} style={{width:'100%'}} />

			<Draggable id='drag-imga' style={{position:'absolute', border:"dotted 1px black", opacity:'50%', top:ay,left:ax,width:aw+'%'}}>
				<img src={aimg} style={{width:'100%'}}/>
			</Draggable>
			<div style={{position:'absolute', top:ay, marginTop:"-1.1em", left:ax, width:'150px'}}>
				<PropControl label='zoom' prop='aw' type="range" step="0.01" min="10" max="80" name="aw" value="30" />
			</div>

		</DropZone>

		<PropControl dflt='With you in spirit' prop='msg' />
		<h1>Season's Greetings</h1>
	</div>;
};

export default CardEditorPage;
