import React, { useState, useEffect, useRef } from 'react';
import DataStore from '../base/plumbing/DataStore';
import { space } from '../base/utils/miscutils';
import _ from 'lodash';
import { assMatch } from '../base/utils/assert';
import { getT4GLayout } from './NewTabLayouts';

const tutorialPath = ['widget', 'TutorialCard'];
// TODO document what these mean -- is open a boolean? an ID? or ??
const tutorialOpenPath = [...tutorialPath, 'open'];
const tutorialPagePath = [...tutorialPath, 'page'];
const tutorialRectPath = [...tutorialPath, 'rect'];


const NewtabTutorialCard = ({ tutorialPages, charityId, onClose }) => {
	const open = DataStore.getValue(tutorialOpenPath);
	const page = DataStore.getValue(tutorialPagePath) || 0;
	const [layoutWarning, setLayoutWarning] = useState(false);
	const [showLayoutWarning, setShowLayoutWarning] = useState(false);
	const layout = getT4GLayout();
	// deep copy to prevent mutation
	let tutPages = [...tutorialPages];
	let layoutWarningPage = <>
		<h2>Hidden parts</h2>
		<p>
			You are using a layout that hides some of the Tabs for Good page.
			<br />
			These will be shown for the tutorial.
			Change your layout to see them again!
		</p>
	</>;

	useEffect(() => {
		if (layout !== "full") {
			// some components will be hidden - insert warning page
			setLayoutWarning(true);
		}
	}, []);

	useEffect(() => {
		let { tutOpen, tutPage } = DataStore.getValue(['location', 'params']);
		// Update only on second setting
		if (tutOpen) DataStore.setValue(tutorialOpenPath, tutOpen, false);
		if (tutPage) DataStore.setValue(tutorialPagePath, tutPage, true);
	}, []);

	if (!open) return null;

	assMatch(page, Number);
	const setPage = (num) => {
		if (num === 1) {
			if (layoutWarning) {
				setShowLayoutWarning(true);
				setLayoutWarning(false);
				return;
			} else {
				setShowLayoutWarning(false);
			}
		}
		if (num > tutPages.length - 1) {
			DataStore.setValue(tutorialOpenPath, false);
			DataStore.setValue(tutorialPagePath, 0);
			onClose();
		} else {
			DataStore.setValue(tutorialPagePath, num);
		}
	};

	if (charityId) {
		tutPages[1] = <>
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

	if (page > tutPages.length - 1) {
		DataStore.setValue(tutorialOpenPath, false);
		onClose();
	}
	const beforeLastPage = page < tutPages.length - 1;

	let desiredSize = { width: 370, height: 350 };

	let style = {
		zIndex: 9999,
		top: "50%",
		left: "70%",
		transform: "translateY(-50%)",
		/*
		top:rect.top,
		left:rect.left,
		right:rect.right,
		bottom:rect.bottom,*/
		width: desiredSize.width,
		height: desiredSize.height,
		maxWidth: "28vw" // fix "card goes off-screen" for some laptops, layout bug of 2021-11-15
	};

	if (page === 0 || (layout !== "full" && page < 2)) {
		style.left = "50%";
		style.transform = "translate(-50%, -50%)";
	}

	return <>
		<div className="position-absolute" style={{ width: "100vw", height: "100vh", top: 0, left: 0, zIndex: 999, background: "rgba(0,0,0,0.25)" }} />
		<div className="tutorial-card bg-white position-absolute shadow text-center p-4 flex-column justify-content-between align-items-center unset-margins"
			style={style}
		>
			<div className="flex-column unset-margins justify-content-center align-items-center">
				<div className="tutorial-content mt-2">
					{showLayoutWarning ? layoutWarningPage : tutPages[page]}
				</div>
				<div className="flex-row justify-content-center align-items-center unset-margins">
					<button type="button" className="btn btn-primary" onClick={() => setPage(page + 1)}>{beforeLastPage ? "NEXT" : "GOT IT"}</button>
				</div>
			</div>
			<div className="flex-row justify-content-center align-items-center unset-margins mt-3">
				{tutPages.map((t, i) => <PageCircle pageNum={i} key={i} selectedPageNum={page} onClick={() => setPage(i)} />)}
			</div>
			<a className="position-absolute" style={{ top: 10, right: 20 }} onClick={e => {
				e.preventDefault();
				DataStore.setValue(tutorialOpenPath, false);
				DataStore.setValue(tutorialPagePath, 0);
				onClose();
			}}><h5 className="color-gl-light-red" style={{ fontSize: "1rem" }}>SKIP</h5></a>
		</div>
	</>;
};

const PageCircle = ({ pageNum, selectedPageNum, onClick }) => {
	return <div className={space("page-circle mr-1 ml-1", pageNum <= selectedPageNum ? "selected" : "")} onClick={onClick} />;
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
const TutorialComponent = ({ page, customSelectStyle, style, children, className }) => {
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
const TutorialHighlighter = ({ page, style, children, className }) => {
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
		bottom: 170,
		left: 20,
		/*
		top:rect.top,
		left:rect.left,
		right:rect.right,
		bottom:rect.bottom,*/
		width: 400,
		height: 300
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
						width: 0, height: 0,
						borderLeft: "10px solid transparent",
						borderRight: "10px solid transparent",
						borderTop: "10px solid white",
						top: "100%",
						left: "5%"
					}}
				/>
			</div>
			<a className="position-absolute" style={{ top: 10, right: 20 }}
				onClick={e => {
					e.preventDefault();
					setShowing(false);
				}}
			>
				<h5 className="color-gl-light-red" style={{ fontSize: "1rem" }}>X</h5>
			</a>
		</div>;
};

export { openTutorial, TutorialComponent, TutorialHighlighter, PopupWindow };
export default NewtabTutorialCard;
