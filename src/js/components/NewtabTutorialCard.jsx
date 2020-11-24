import React, { useState } from 'react';
import DataStore from '../base/plumbing/DataStore';
import { space } from '../base/utils/miscutils';

const tutorialPath = ['widget', 'TutorialCard'];
const tutorialOpenPath = [...tutorialPath, 'open'];

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
	const [page, setPage] = useState(0);
	if (page > tutorialPages.length - 1) {
		DataStore.setValue(tutorialOpenPath, false);
	}
	const beforeLastPage = page < tutorialPages.length - 1;

	return open && <>
        <div className="position-absolute" style={{width: "100vw", height: "100vh", top: 0, left: 0, zIndex: 999, background:"rgba(0,0,0,0.25)"}} />
		<div className="tutorial-card bg-white position-absolute shadow text-center p-4"
			style={{
                zIndex: 9999,
				top:tutorialPages[page].top,
				left:tutorialPages[page].left,
				right:tutorialPages[page].right,
				bottom:tutorialPages[page].bottom,
				transform:tutorialPages[page].transform,
                width:500}}
		>
			{tutorialPages[page].content}
			<div className="flex-row justify-content-center align-items-center unset-margins">
				<button type="button" className="btn btn-transparent fill mr-2" onClick={() => DataStore.setValue(tutorialOpenPath, false)}>{beforeLastPage ? "SKIP" : "GOT IT"}</button>
				{beforeLastPage && <button type="button" className="btn btn-primary" onClick={() => setPage(page + 1)}>NEXT</button>}
			</div>
			<div className="flex-row justify-content-center align-items-center unset-margins mt-3">
				{tutorialPages.map((t, i) => <PageCircle pageNum={i} key={i} selectedPageNum={page}/>)}
			</div>
		</div>
	</>;
};

const PageCircle = ({pageNum, selectedPageNum}) => {
	return <div className={space("page-circle mr-1 ml-1", pageNum <= selectedPageNum ? "selected" : "")}/>;
};

const openTutorial = () => {
	DataStore.setValue(tutorialOpenPath, true);
};

export { openTutorial };
export default NewtabTutorialCard;
