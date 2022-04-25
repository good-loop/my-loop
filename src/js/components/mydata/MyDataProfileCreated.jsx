import React from 'react';
import { MyDataCard, SkipNextBtn } from './MyDataCommonComponents';

const MyDataProfileCreated = ({}) => {

	return <>
	<p>For every piece of data you've shared with us, you can control how it's used.</p>
	<MyDataCard>
			<hr/>
			<p>YOUR LOCATION</p>

	</MyDataCard>
			<SkipNextBtn /> 
	</>;   

};

export default MyDataProfileCreated;
