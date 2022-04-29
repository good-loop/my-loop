import React from "react";

/**
 * 
 * @param {string} badgeName
 * @param {int} progress 
 * @param {int} notification
 * @param {int} size of the badge in px, default is 100.
 * @param {string} linkTo url to link to when clicking the badge.
 * @returns 
 */
const MyDataBadge = ({progress, badgeName, backgroundImage, notification, size, linkTo}) => {
	if (!progress) {
		progress = 0;
		notification = null;
	}
	if (!badgeName) badgeName = "Data";

	if (!size) size = 100;
	const stroke = size * .06;
	const radius = size / 2;
	const innerSize = size - stroke * 5;
	const plusSignTop = size *.15;
	const plusSignRight = size *.15;

	const normalizedRadius = radius - stroke * 2;
	const circumference = normalizedRadius * 2 * Math.PI;
	const strokeDashoffset = circumference - progress / 100 * circumference;

	return ( <a href={linkTo}>
	<div className="mydata-badge text-center" style={{height:size+"px",width:size+"px"}}>
		<div className="inner" style={{backgroundImage:`url('${backgroundImage}')`,backgroundSize:innerSize,width:innerSize,height:innerSize}}></div>
		<svg
			height={radius * 2}
			width={radius * 2}
		>
			<circle
				stroke="#61B7CF"
				fill="transparent"
				strokeWidth={ stroke }
				strokeDasharray={ circumference + ' ' + circumference }
				style={ { strokeDashoffset } }
				stroke-width={ stroke }
				r={ normalizedRadius }
				cx={ radius }
				cy={ radius }
			/>
		</svg>
		<span>{badgeName}</span>
		{!progress && <img src="/img/mydata/plus_whitebg.svg" className="plus-sign" style={{width:size*.2,top:plusSignTop,right:plusSignRight}} />}
		{notification && <div className="notification" style={{height:size*.2, width:size*.2,top:size*.4,right:"0"}}>
			<div className="number" style={{fontSize:size*.125}}>{notification}</div></div>}
	</div></a>)
};

export default MyDataBadge;