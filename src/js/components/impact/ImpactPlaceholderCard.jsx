import React, { useEffect, useState, useRef } from 'react';

/**
 * 
 * @param {Object} p
 */
export const PlaceholderCard = ({cardName}) => {
	return (
	<div className="story-card">
		<p>{cardName}</p>
		<img src="https://iili.io/HvYwHSj.png" style={{height: "200px", width:"200px"}}/>
	</div>
	);
};
