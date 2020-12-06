
import React from 'react';
import { Button } from 'reactstrap';
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

	let aimg = DataStore.getUrlValue("aimg");
	let bimg = DataStore.getUrlValue("bimg");
	let bg = '/img/card/snowman-scene.png'

	let ax = DataStore.getUrlValue("ax") || '20%';
	let ay = DataStore.getUrlValue("ay") || 50;
	let aw = DataStore.getUrlValue("aw") || 30;
	let bx = DataStore.getUrlValue("bx") || '70%';
	let by = DataStore.getUrlValue("by") || 50;
	let bw = DataStore.getUrlValue("bw") || 30;

	const onDrop = (e, dropInfo) => {			
		let did = dropInfo.draggable;
		console.warn(dropInfo, did, e);
		const prefix = did[did.length-1];
		DataStore.setUrlValue(prefix+"x", dropInfo.zoneX + 'px');
		DataStore.setUrlValue(prefix+"y", dropInfo.zoneY);
	};
	return <div className='avoid-navbar position-relative'>

		<DropZone id='the-scene' onDrop={onDrop}>			

			

			<FacePic prefix='a' x={ax} y={ay} w={aw} img={aimg} />
			<FacePic prefix='b' x={bx} y={by} w={bw} img={bimg} />

			<img src={bg} style={{ width: '100%' }} draggable={false} />

		</DropZone>

		<PropControl dflt='With you in spirit' prop='msg' />
		<h1>Season's Greetings</h1>
	</div>;
};

const FacePic = ({ prefix, img, x, y, w}) => {
	let flip = DataStore.getUrlValue(prefix+"flip");
	//  ◭ ⏃ 
	return (<>
		<Draggable id={'drag-'+prefix} style={{ position: 'absolute', border: "dotted 1px black", opacity: '50%', top: y+'px', left: x, width: w + '%' }}>
			{img ? <img src={img} style={{ width: '100%', transform: flip? "scaleX(-1)" : null }} /> : <PropControl type='imgUpload' prop={prefix+'img'} />}
		</Draggable>		
		<div className='flex-row' style={{ position: 'absolute', top:y+'px', marginTop: "-1.2em", left: x, width: '150px' }}>
			<Button color='secondary' size='xs' onClick={e => DataStore.setUrlValue(prefix+'flip', ! flip)} disabled={ ! img}>▶◁</Button>
			<PropControl prop={prefix+'w'} type="range" step="0.01" min="10" max="80" name={prefix+"w"} value="30" />
			<Button color='secondary' size='xs' onClick={e => DataStore.setUrlValue(prefix+'img',null)} disabled={ ! img} >🗑</Button>
		</div>
	</>);
};

export default CardEditorPage;
