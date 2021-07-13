import React, { useState, useEffect, useRef } from 'react';
import DataStore from '../base/plumbing/DataStore';
import { space } from '../base/utils/miscutils';
import _ from 'lodash';
import { assMatch } from '../base/utils/assert';

const tutorialPath = ['widget', 'TutorialCard'];
// TODO document what these mean -- is open a boolean? an ID? or ??
const tutorialOpenPath = [...tutorialPath, 'open'];
const tutorialPagePath = [...tutorialPath, 'page'];
const tutorialRectPath = [...tutorialPath, 'rect'];


const NewtabTutorialCard = ({tutorialPages, charityId, onClose}) => {
	const open = DataStore.getValue(tutorialOpenPath);
	const page = DataStore.getValue(tutorialPagePath) || 0;

	useEffect(() => {
		let {tutOpen, tutPage} = DataStore.getValue(['location', 'params']);
		// Update only on second setting
		if (tutOpen) DataStore.setValue(tutorialOpenPath, tutOpen, false);
		if (tutPage) DataStore.setValue(tutorialPagePath, tutPage, true);
		console.log("DO WE MANUALLY SET THE TUTORIAL? ", tutOpen, tutPage);
	}, []);

	if ( ! open) return null;

	assMatch(page, Number);
	const setPage = (num) => {
		if (num > tutorialPages.length - 1) {
			DataStore.setValue(tutorialOpenPath, false);
			DataStore.setValue(tutorialPagePath, 0);
			onClose();
		} else {
			DataStore.setValue(tutorialPagePath, num);
		}
	};

	if (charityId) {
		tutorialPages[1] = <>
			<h2>Your charity</h2>
			<p>
			Your charity is set up to receive donations from the money you generate!
			</p>
		</>;
	}

	// // Set page to 0 by default
	// useEffect(() => {
	// 	// Use of != is purposeful here: only match if number is explicitly equal, avoid re-render loops
	// 	if (!page && page != 0) setPage(0);
	// });

	if (page > tutorialPages.length - 1) {
		DataStore.setValue(tutorialOpenPath, false);
		onClose();
	}
	const beforeLastPage = page < tutorialPages.length - 1;

	let desiredSize = {width: 370, height: 350}
	// NOTE: The following code gets the tutorial box to automatically size and position itself to any given component.
	// It's no longer used, but I have left it here in case the same functionality is needed later
	/*
	let targetRect = DataStore.getValue(tutorialRectPath);
	let rect = {};
	if (window.innerWidth <= 1280) {
		desiredSize.width = 300;
	}
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
	}*/
	// END SIZE/POSITION CODE

	let style = {
		zIndex: 9999,
		top:"50%",
		left:window.innerWidth <= 1280 ? "75%" : "70%",
		transform:"translateY(-50%)",
		/*
		top:rect.top,
		left:rect.left,
		right:rect.right,
		bottom:rect.bottom,*/
		width:desiredSize.width,
		height:desiredSize.height
	};

	if (page == 0) {
		style.left = "50%";
		style.transform = "translate(-50%, -50%)";
	}

	return <>
		<div className="position-absolute" style={{width: "100vw", height: "100vh", top: 0, left: 0, zIndex: 999, background:"rgba(0,0,0,0.25)"}} />
		<div className="tutorial-card bg-white position-absolute shadow text-center p-4 flex-column justify-content-between align-items-center unset-margins"
			style={style}
		>
			<div className="flex-column unset-margins justify-content-center align-items-center">
				<div className="tutorial-content mt-2">
					{tutorialPages[page]}
				</div>
				<div className="flex-row justify-content-center align-items-center unset-margins">
					<button type="button" className="btn btn-primary" onClick={() => setPage(page + 1)}>{beforeLastPage ? "NEXT" : "GOT IT"}</button>
				</div>
			</div>
			<div className="flex-row justify-content-center align-items-center unset-margins mt-3">
				{tutorialPages.map((t, i) => <PageCircle pageNum={i} key={i} selectedPageNum={page} onClick={() => setPage(i)}/>)}
			</div>
			<a className="position-absolute" style={{top:10, right:20}} onClick={e => {
				e.preventDefault();
				DataStore.setValue(tutorialOpenPath, false);
				DataStore.setValue(tutorialPagePath, 0);
				onClose();
			}}><h5 className="color-gl-light-red" style={{fontSize:"1rem"}}>SKIP</h5></a>
		</div>
	</>;
};

const PageCircle = ({pageNum, selectedPageNum, onClick}) => {
	return <div className={space("page-circle mr-1 ml-1", pageNum <= selectedPageNum ? "selected" : "")} onClick={onClick}/>;
};

const openTutorial = () => {
	DataStore.setValue(tutorialOpenPath, true);
};

/**
 * Use as a div that will be recognized by the NewtabTutorialCard when active
 * 
 * @param {Object} p
 * @param {!Number} p.page TODO in hindsight, using numbers makes any reordering tricky.
 * Maybe switch to named tutorial pages, and specify a list of names as the path??
 */
const TutorialComponent = ({page, customSelectStyle, style, children, className}) => {
	const current = DataStore.getValue(tutorialPagePath);
	const open = DataStore.getValue(tutorialOpenPath);
	const rect = DataStore.getValue(tutorialRectPath);
	const selfRef = useRef(null);
	assMatch(page, Number);

	let highlight = current === page;

	// if (Array.isArray(page)) {
	// 	highlight = page.includes(current);
	// }

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

	const selectStyle = customSelectStyle;// || {zIndex:1000, borderRadius:"25px", border: "3px red solid"};
	let combinedStyle = style || {};
	if (highlight && open) Object.assign(combinedStyle, selectStyle);
	return <div className={space("tutorial-component position-relative", className, highlight ? "highlight" : "")} style={combinedStyle} ref={selfRef}>
		{children}
	</div>;
};

/**
 * Use in place of a div when needed
 * Does not represent a full component, but helps bring out z-index highlights when TutorialComponents z-index's are being overriden from a parent
 * @param {Number | Array} page The page(s) to highlight on
 */
const TutorialHighlighter = ({page, style, children, className}) => {
	const current = DataStore.getValue(tutorialPagePath);
	const open = DataStore.getValue(tutorialOpenPath);

	let pageMatch = current === page;
	if (!pageMatch && Array.isArray(page)) {
		pageMatch = page.includes(current);
	}
	const highlight = pageMatch && open;

	if (highlight) style.zIndex = 1000;
	return <div className={space("tutorial-highlighter", className, highlight ? "highlight" : "")} style={style}>
		{children}
	</div>;
};

const PopupWindow = () => {

	const [showing, setShowing] = useState(true);

	let style = {
		zIndex: 9999,
		bottom:170,
		left:20,
		/*
		top:rect.top,
		left:rect.left,
		right:rect.right,
		bottom:rect.bottom,*/
		width:400,
		height:300
	};
	return showing &&
		<div className="tutorial-card bg-white position-absolute shadow text-center p-4 flex-column justify-content-between align-items-center unset-margins"
			style={style}
		>
			<div className="flex-column unset-margins justify-content-center align-items-center">
				<div className="tutorial-content mt-2">
					<h2>No need to click</h2>
					<p>Remember, you don't have to click the banner ads, you are raising money simply by allowing the ads to appear in your tabs.</p>
				</div>
				<div className="flex-row justify-content-center align-items-center unset-margins">
					<button type="button" className="btn btn-transparent fill" onClick={() => setShowing(false)}>GOT IT</button>
				</div>
				<div className="position-absolute"
					style={{
						width:0, height:0,
						borderLeft:"10px solid transparent",
						borderRight:"10px solid transparent",
						borderTop:"10px solid white",
						top:"100%",
						left:"5%"
					}}
				/>
			</div>
			<a className="position-absolute" style={{top:10, right:20}}
				onClick={e => {
					e.preventDefault();
					setShowing(false);
				}}
			>
				<h5 className="color-gl-light-red" style={{fontSize:"1rem"}}>X</h5>
			</a>
		</div>;
}

export { openTutorial, TutorialComponent, TutorialHighlighter, PopupWindow };
export default NewtabTutorialCard;
