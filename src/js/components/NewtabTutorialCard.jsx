import React, { useState, useEffect, useRef } from 'react';
import DataStore from '../base/plumbing/DataStore';
import { space } from '../base/utils/miscutils';
import _ from 'lodash';

const tutorialPath = ['widget', 'TutorialCard'];
const tutorialOpenPath = [...tutorialPath, 'open'];
const tutorialPagePath = [...tutorialPath, 'page'];
const tutorialRectPath = [...tutorialPath, 'rect'];

const tutorialPages = [
	{
		top:"50%",
		left:"50%",
		transform:"translate(-50%, -50%)",
		content: <>
			<h2>Success!</h2>
			<p>
				Thanks for signing up to Tabs for Good!<br/>
				You are now raising money for your favourite charity every time you open a new tab.
			</p>
		</>
	},
	{
		top:"62%",
		left:"35%",
		transform:"translate(-50%, -50%)",
		content: <>
			<h2>Doing extra good</h2>
			<p>
				We use Ecosia as our default search engine, so you can raise money for multiple good causes.
			</p>
		</>
	},
	{
		top:"65%",
		left:"67%",
		transform:"translate(-50%, -50%)",
		content: <>
			<h2>It's your choice</h2>
			<p>
				You choose the charity you want to support. We will send them all the money you raise through Tabs for Good. You can change your mind at any time in your account settings.
			</p>
		</>
	},
	{
		top:"25%",
		left:"60%",
		transform:"translate(-50%, -50%)",
		content: <>
			<h2>Check our progress</h2>
			<p>
				See how much money we've raised so far! :)
			</p>
		</>
	},
	{
		bottom:"120px",
		left:"50%",
		transform:"translate(-50%, 0)",
		content: <>
			<h2>Where the money comes from</h2>
			<p>
				50% of the ad revenue received is going to the charity you choose.
			</p>
		</>
	},
	{
		top:"90px",
		right:"10px",
		content: <>
			<h2>Your account</h2>
			<p>
				Access your account here to change your settings, including your choice of charity.
			</p>
		</>
	},
	{
		top:"90px",
		left:"10px",
		content: <>
			<h2>Explore the Loop</h2>
			<p>
				Find out more about Good-Loop and what more you can do for good at My-Loop.
			</p>
		</>
	}
];

const NewtabTutorialCard = () => {
	let open = DataStore.getValue(tutorialOpenPath);
	const page = DataStore.getValue(tutorialPagePath);
	const setPage = (num) => {
		DataStore.setValue(tutorialPagePath, num);
	};

	// Set page to 0 by default
	useEffect(() => {
		// Use of != is purposeful here: only match if number is explicitly equal, avoid re-render loops
		if (!page && page != 0) {
			setPage(0);
		}
	});

	if (page > tutorialPages.length - 1) {
		DataStore.setValue(tutorialOpenPath, false);
	}
	const beforeLastPage = page < tutorialPages.length - 1;

	let targetRect = DataStore.getValue(tutorialRectPath);
	let rect = {};
	const desiredSize = {width: 400, height: 400}
	const padding = 20;
	console.log("SCREEN SIZE: " + window.innerWidth + ", " + window.innerHeight);
	if (!targetRect) {
		rect = {
			top: "calc(50% - 200px)",
			bottom: "calc(50% - 200px)",
			left: "calc(50% - 200px)",
			right: "calc(50% - 200px)",
		};
	} else {

		// All calculations assume no scroll
		let centerPos = {x: targetRect.left + (targetRect.width / 2), y: targetRect.top + (targetRect.height / 2)};
		
		// Calculate which sides to favour when positioning
		// Directions of offsets
		let hDir, vDir;
		if (centerPos.x > window.innerWidth / 2) {
			// Target is on right of screen, so favour left side
			hDir = -1;
		} else {
			hDir = 1;
		}
		if (centerPos.y > window.innerHeight / 2) {
			// Target is on right of screen, so favour left side
			vDir = -1;
		} else {
			vDir = 1;
		}

		// If going down
		if (vDir === 1) {
			// Place just underneath component
			rect.top = padding + targetRect.bottom;
			rect.bottom = rect.top + desiredSize.height;
			if (rect.bottom > window.innerHeight) {
				// Snap to screen bottom
				rect.bottom = window.innerHeight;
				rect.top = rect.bottom - desiredSize.height;
			}
		} else { // Going up
			// Place just above component
			rect.bottom = targetRect.top - padding;
			rect.top = rect.bottom - desiredSize.height;
			if (rect.top < 0) {
				// Snap to screen top
				rect.top = 0;
				rect.bottom = rect.top + desiredSize.height;
			}
		}

		// Horizontally center tutorial card to target
		rect.left = centerPos.x - (desiredSize.width / 2);
		rect.right = centerPos.x + (desiredSize.width / 2);

		// If exceeding screen bounds, snap to screen edges
		if (rect.left < 0) {
			rect.left = 0;
			rect.right = desiredSize.width;
		}
		if (rect.right > window.innerWidth) {
			rect.right = window.innerWidth;
			rect.left = window.innerWidth - desiredSize.width;
		}
	}

	return open && <>
		<div className="position-absolute" style={{width: "100vw", height: "100vh", top: 0, left: 0, zIndex: 999, background:"rgba(0,0,0,0.25)"}} />
		<div className="tutorial-card bg-white position-absolute shadow text-center p-4 flex-column justify-content-between align-items-center unset-margins"
			style={{
				zIndex: 9999,
				/*top:tutorialPages[page].top,
				left:tutorialPages[page].left,
				right:tutorialPages[page].right,
				bottom:tutorialPages[page].bottom,
				transform:tutorialPages[page].transform,*/
				top:rect.top,
				left:rect.left,
				right:rect.right,
				bottom:rect.bottom,
				width:desiredSize.width,
				height:desiredSize.height
			}}
		>
			<div className="tutorial-content">
				{tutorialPages[page].content}
			</div>
			<div className="flex-row justify-content-center align-items-center unset-margins">
				<button type="button" className="btn btn-transparent fill mr-2" onClick={() => DataStore.setValue(tutorialOpenPath, false)}>{beforeLastPage ? "SKIP" : "GOT IT"}</button>
				{beforeLastPage && <button type="button" className="btn btn-primary" onClick={() => setPage(page + 1)}>NEXT</button>}
			</div>
			<div className="flex-row justify-content-center align-items-center unset-margins mt-3">
				{tutorialPages.map((t, i) => <PageCircle pageNum={i} key={i} selectedPageNum={page}/>)}
			</div>
			<a className="position-absolute" style={{top:10, right:20}} onClick={e => {
				e.preventDefault();
				DataStore.setValue(tutorialOpenPath, false);
			}}>x</a>
		</div>
	</>;
};

const PageCircle = ({pageNum, selectedPageNum}) => {
	return <div className={space("page-circle mr-1 ml-1", pageNum <= selectedPageNum ? "selected" : "")}/>;
};

const openTutorial = () => {
	DataStore.setValue(tutorialOpenPath, true);
};

const TutorialComponent = ({page, customSelectStyle, style, children, className}) => {
	const current = DataStore.getValue(tutorialPagePath);
	const open = DataStore.getValue(tutorialOpenPath);
	const rect = DataStore.getValue(tutorialRectPath);
	const selfRef = useRef(null);
	
	let highlight = current === page;
	if (Array.isArray(page)) {
		highlight = page.includes(current);
	}

	useEffect(() => {
		const myRect = selfRef.current.getBoundingClientRect();
		myRect.page = page;
		let isSameRect = rect ? myRect.page === rect.page : false;
		if (rect && Array.isArray(myRect.page)) {
			isSameRect = _.isEqual(myRect.page, rect.page);
		}
		if (selfRef.current && highlight && (!rect || !isSameRect)) {
			// Dont update with the new rect yet - or whole render will repeat before getting to setting the flag
			DataStore.setValue(tutorialRectPath, myRect);
		}
	});

	const selectStyle = customSelectStyle || {zIndex:1000, background:"rgba(255,255,255,0.7)", borderRadius:"50px", boxShadow:"0px 0px 5px rgba(255,255,255,1)"};
	let combinedStyle = style || {};
	if (highlight && open) Object.assign(combinedStyle, selectStyle);
	return <div className={space("tutorial-component position-relative", className, highlight ? "highlight" : "")} style={combinedStyle} ref={selfRef}>
		{children}
	</div>;
};

export { openTutorial, TutorialComponent };
export default NewtabTutorialCard;
