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


const NewtabTutorialCard = ({tutorialPages}) => {
	const open = DataStore.getValue(tutorialOpenPath);
	if ( ! open) return null;
	const page = DataStore.getValue(tutorialPagePath) || 0;
	assMatch(page, Number);
	const setPage = (num) => {
		DataStore.setValue(tutorialPagePath, num);
	};

	// // Set page to 0 by default
	// useEffect(() => {
	// 	// Use of != is purposeful here: only match if number is explicitly equal, avoid re-render loops
	// 	if (!page && page != 0) {
	// 		setPage(0);
	// 	}
	// });

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
	
	return <>
		<div className="position-absolute" style={{width: "100vw", height: "100vh", top: 0, left: 0, zIndex: 999, background:"rgba(0,0,0,0.25)"}} />
		<div className="tutorial-card bg-white position-absolute shadow text-center p-4 flex-column justify-content-between align-items-center unset-margins"
			style={{
				zIndex: 9999,
				top:rect.top,
				left:rect.left,
				right:rect.right,
				bottom:rect.bottom,
				width:desiredSize.width,
				height:desiredSize.height
			}}
		>
			<div className="tutorial-content">
				{tutorialPages[page]}
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

/**
 * TODO Doc: How should this be used??
 * 
 * @param {Object} p
 * @param {!Number} p.page TODO in hindsight, using numbers makes any reordering tricky.
 * Maybe switch to named tutoriaal pages, and specify a list of names as the path??
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

	const selectStyle = customSelectStyle || {zIndex:1000, borderRadius:"50px", border: "3px red solid"};
	let combinedStyle = style || {};
	if (highlight && open) Object.assign(combinedStyle, selectStyle);
	return <div className={space("tutorial-component position-relative", className, highlight ? "highlight" : "")} style={combinedStyle} ref={selfRef}>
		{children}
	</div>;
};

export { openTutorial, TutorialComponent };
export default NewtabTutorialCard;
