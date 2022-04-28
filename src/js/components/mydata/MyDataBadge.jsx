import React from "react";

const MyDataBadge = ({progress, badgeName, backgroundImage}) => {
	if (!progress) progress = 0;
	if (!badgeName) badgeName = "Data";

	const size = 100;
	const radius = size / 2;
	const stroke = 6;
	const innerSize = size - stroke * 5;
	const plusSignSize = size * .15;
	const plusSignTop = size *.15;
	const plusSignRight = size *.15;

	const normalizedRadius = radius - stroke * 2;
	const circumference = normalizedRadius * 2 * Math.PI;
	const strokeDashoffset = circumference - progress / 100 * circumference;


	return ( <div className="mydata-badge text-center" style={{height:size+"px",width:size+"px"}}>
		<div className="inner" style={{backgroundColor:"grey",backgroundImage:`url('${backgroundImage}')`,width:innerSize+"px",height:innerSize+"px"}}></div>
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
		{!progress && <img src="/img/mydata/plus_whitebg.svg" className="plus-sign" style={{width:plusSignSize,top:plusSignTop,right:plusSignRight}} />}
	</div>)
};

export default MyDataBadge;