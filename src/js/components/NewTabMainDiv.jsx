import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import BG from "../base/components/BG";
import MainDivBase from "../base/components/MainDivBase";
import { nonce } from "../base/data/DataClass";
// Plumbing
import C from "../C";
import DataStore from "../base/plumbing/DataStore";
import { lg } from "../base/plumbing/log";
import detectAdBlock from "../base/utils/DetectAdBlock";
import { encURI, space, stopEvent } from "../base/utils/miscutils";
import Login from "../base/youagain";
import ServerIO from "../plumbing/ServerIO";
// Components
import AccountMenu from "../base/components/AccountMenu";
import CharityLogo from "./CharityLogo";
import NewtabLoginWidget, { NewtabLoginLink, setShowTabLogin } from "./NewtabLoginWidget";
// import RedesignPage from './pages/RedesignPage';
import Roles from "../base/Roles";
import Claim from "../base/data/Claim";
import Person, { getPVClaim, getProfile } from "../base/data/Person";
import { NewTabCustomise } from "./NewTabCustomise";
import { getT4GLayout, getT4GTheme, getT4GThemeData } from "./NewTabLayouts";
import NewtabTutorialCard, { PopupWindow, TutorialComponent, TutorialHighlighter, openTutorial } from "./NewtabTutorialCard";
import TickerTotal from "./TickerTotal";
import { accountMenuItems } from "./pages/CommonComponents";
import { fetchCharity } from "./pages/MyCharitiesPage";
import { Search, getPVSelectedCharityId } from "./pages/TabsForGoodSettings";

// DataStore
C.setupDataStore();

ServerIO.USE_PROFILER = true;

// Actions

Login.dataspace = C.app.dataspace;

/**
 * NB: useEffect was triggering twice (perhaps cos of the login dance)
 */
let logOnceFlag;

/**
 * Same for trying to verify user once ^^
 */
let verifiedLoginOnceFlag;

/**
 * The main Tabs for Good page
 *
 */
const WebtopPage = () => {
	Login.app = "t4g.good-loop.com"; // Not My.GL!
	const pvCharityID = getPVSelectedCharityId();
	const charityID = pvCharityID && (pvCharityID.value || pvCharityID.interim);
	const loadingCharity = !pvCharityID || !pvCharityID.resolved;
	let [showPopup, setShowPopup] = useState(false);

	// Yeh - a tab is opened -- let's log that (once only)
	if (!logOnceFlag && Login.isLoggedIn()) {
		let pvPerson = getProfile();
		pvPerson.promise.then((person) => {
			// This is the problem, how do we get 'person' before this?
			// Hurrah - T4G is definitely installed
			if (person) {
				Person.setHasApp(person, Login.app);
				return;
			}
			console.warn("no person?!");
		});
		lg("tabopen", { nonce: nonce(6) }); // Include nonce to break deduping of multiple tab-open events within 15-minute bucket
		// Wait 1.5 seconds before logging ad view - 1 second for ad view profit + .5 to load
		setTimeout(() => {
			// Avoid race condition: don't log until we know we have charity ID
			pvCharityID.promise.then((cid) => lg("tabadview", { nonce: nonce(6), cid }));
		}, 1500);
		logOnceFlag = true;
	}

	const checkIfOpened = () => {
		if (!window.localStorage.getItem("t4gOpenedB4")) {
			window.localStorage.setItem("t4gOpenedB4", true);
			openTutorial();
		}
	};

	if (!verifiedLoginOnceFlag) {
		// Popup login widget if not logged in
		// Login fail conditions from youagain.js
		Login.verify()
			.then((res) => {
				if (!res || !res.success) {
					setShowTabLogin(true);
				} else {
					checkIfOpened();
				}
			})
			.catch(() => {
				setShowTabLogin(true);
			});
		verifiedLoginOnceFlag = true;
	}

	// iframe src change?
	// https://stackoverflow.com/posts/17316521/revisions

	// Background images on tab plugin sourced locally, but not on Safari

	const [bookmarksData, setBookmarksData] = useState([]);

	const handleMessage = (event) => {
		if (!event.origin.includes("chrome-extension://") || typeof event.data !== "object") return;
		setBookmarksData(event.data);
	};

	useEffect(() => {
		window.addEventListener("message", handleMessage);
		window.parent.postMessage("give-me-bookmarks", "*");
		return () => window.removeEventListener("message", handleMessage);
	}, []);

	const [customiseModalOpen, setCustomiseModalOpen] = useState(false);

	const layout = getT4GLayout();
	const curTheme = getT4GTheme();
	const { backdropImages, t4gLogo, backgroundColor } = getT4GThemeData(curTheme);

	const [rand, setRand] = useState(Math.round(Math.random() * 9) + 1); // use state to prevent new random numbers each update
	// update rand if the image list changes
	useEffect(() => {
		if (backdropImages?.length) {
			setRand(Math.floor(Math.random() * backdropImages.length));
		} else {
			setRand(Math.round(Math.random() * 9) + 1);
		}
	}, []);

	const customBG = backdropImages && rand < backdropImages.length ? backdropImages[rand].contentUrl || backdropImages[rand] : null;

	return (
		<div className={space("t4g", "layout-" + layout)}>
			{!Roles.isDev() && <style>{".MessageBar .alert {display: none;}"}</style>}
			{/* NB: Rendering background image here can avoid a flash of white before the BG get loaded */}
			<BG bg src={customBG} fullscreen opacity={1} bottom={0} style={{ backgroundPosition: "center", backgroundColor: backdropImages && backdropImages.length ? null : backgroundColor }} alwaysDisplayChildren>
				<NewTabCharityCard cid={charityID} loading={loadingCharity} />
				<TutorialHighlighter page={[4, 5]} className="position-fixed p-3" style={{ top: 0, left: 0, width: "100vw", zIndex: 1 }}>
					<div className="d-flex justify-content-end">
						<TutorialComponent page={4} className="user-controls flex-row align-items-center">
							<UserControls cid={charityID} />
						</TutorialComponent>
					</div>
				</TutorialHighlighter>
				<Container fluid className="flex-column justify-content-end align-items-center position-absolute unset-margins" style={{ top: 0, left: 0, width: "100vw", height: "99vh" }}>
					<Row className="h-100 w-100" noGutters>
						<Col sm={3} md={4} />
						<Col sm={6} md={4} className="h-100 flex-column justify-content-center align-items-center unset-margins mt-2">
							{/* Show the total raised across all charities, if the user hasn't selected one. */}
							<TutorialComponent page={2} className="t4g-total">
								<h5 className="text-center together-we-ve-raised" style={{ fontSize: ".8rem" }}>
									Together we've raised <TickerTotal />
								</h5>
							</TutorialComponent>
							<NormalTabCenter style={{ transform: "translate(0,-30%)" }} customLogo={t4gLogo} />
							<LinksDisplay bookmarksData={bookmarksData} style={{ transform: "translate(0,-30%)" }} />
						</Col>
					</Row>
				</Container>
				{/* Tutorial highlight to cover adverts */}
			</BG>
			<TutorialComponent page={3} className="position-absolute" style={{ bottom: 0, left: 0, right: 0, height: 110, width: "100vw" }} />
			<NewtabTutorialCard tutorialPages={tutorialPages} charityId={charityID} onClose={() => setShowPopup(true)} />
			{showPopup && <PopupWindow />}
			<NewtabLoginWidget onRegister={() => checkIfOpened()} />
			<ConnectionStatusPopup />
			<NewTabCustomise modalOpen={customiseModalOpen} setModalOpen={setCustomiseModalOpen} />
		</div>
	);
}; // ./WebTopPage

const PAGES = {
	newtab: WebtopPage,
};

const NewTabMainDiv = () => <MainDivBase pageForPath={PAGES} defaultPage="newtab" navbar={false} className="newtab" />;

/**
 *
 * @param {Object} p
 * @returns
 */
const UserControls = () => {
	const logoutFn = () => (window.top.location.href = `${ServerIO.MYLOOP_ENDPOINT}/logout`);
	const logoutLink = (
		<a href="#" role="button" className="LogoutLink" onClick={logoutFn}>
			Log out
		</a>
	);
	const customLogin = <NewtabLoginLink className="login-menu btn btn-transparent fill">Register / Log in</NewtabLoginLink>;

	return <AccountMenu accountMenuItems={accountMenuItems} linkType="a" small customImg="/img/logo/my-loop-logo-round.svg" customLogin={customLogin} logoutLink={logoutLink} />;
};

const ENGINES = {
	google: {
		title: "Google",
		logo: "https://my.good-loop.com/img/TabsForGood/google.png",
		size: { width: 30, height: 30 },
		url: "https://google.com/search?q=",
	},
	ecosia: {
		title: "Ecosia",
		logo: "https://my.good-loop.com/img/TabsForGood/ecosia.png",
		size: { width: 30, height: 30 },
		url: "https://ecosia.com/search?q=",
	},
	duckduckgo: {
		title: "DuckDuckGo",
		logo: "https://my.good-loop.com/img/TabsForGood/duckduckgo.png",
		size: { width: 30, height: 30 },
		url: "https://duckduckgo.com?q=",
	},
	bing: {
		title: "Bing",
		logo: "https://my.good-loop.com/img/TabsForGood/bing.png",
		size: { width: 30, height: 30 },
		url: "https://bing.com/search?q=",
	},
};

/**
 * Shows search + the charity + amount raised
 * @param {Object} p
 * @returns
 */
const NormalTabCenter = ({ style, customLogo }) => {
	let pvSE = getPVClaim({ xid: Login.getId(), key: "searchEngine" });
	console.log("**************** pvSE", pvSE, "value", Claim.value(pvSE));
	let searchEngine = Claim.value(pvSE) || "google";
	const engineData = ENGINES[searchEngine];

	return (
		<div className="flex-column unset-margins align-items-center tab-center mb-1" style={style}>
			<TutorialComponent page={5} className="py-3 t4g-logo">
				<a href={ServerIO.MYLOOP_ENDPOINT}>
					<img className="tab-center-logo" src={customLogo} alt="logo" />
				</a>
			</TutorialComponent>
			<div className="w-100">
				<div className="tab-search-container mx-auto">
					<Search
						onSubmit={(e) => doSearch(e, searchEngine)}
						placeholder={`Search with ${engineData?.title}`}
						icon={
							<C.A href="/?tab=tabsForGood" title="Click here to change search engine">
								<img
									src={engineData?.logo}
									alt="search icon"
									style={{
										width: engineData?.size?.width,
										height: engineData?.size?.height,
									}}
								/>
							</C.A>
						}
					/>
				</div>
			</div>
		</div>
	);
};

const NewTabCharityCard = ({ cid, loading }) => {
	const charity = cid ? fetchCharity(cid) : null;

	// Use top.location.href instead of C.A to advoid CORS issues.
	const charityLink = charity?.url || `${ServerIO.MYLOOP_ENDPOINT}/account?tab=tabsForGood`;

	return (
		<TutorialComponent page={1} className="NewTabCharityCard">
			<div className="text-center w-100">
				<a href={charityLink} target="_blank" rel="noopener noreferrer" className="charity-cta">
					{charity && <CharityLogo charity={charity} />}
					{!charity && loading && <p className="my-auto">Loading...</p>}
					{!charity && !loading && <p className="my-auto">Select a charity</p>}
				</a>
			</div>
		</TutorialComponent>
	);
};

const CircleLink = ({ domain, url, children, title }) => {
	if (!url) url = "#";
	return (
		<Col
			onClick={() => {
				window.parent.location.href = url;
			}}
			title={title}
			className="bookmark-item d-flex flex-column align-items-center"
		>
			<BG src={`https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=256`} className="bookmark-box shadow mb-1" center style={{ backgroundSize: "1.5rem", backgroundRepeat: "no-repeat" }} />
			{/* <span className="text-white text-center" style={{userSelect:"none",padding:'0 .5rem',paddingTop:'.3rem',borderRadius:'10px',backgroundColor:'rgb(0 0 0 / 10%)'}}>
				{children}
			</span> */}
		</Col>
	);
};

// Usually strip subdomains to avoid 404 favicons - but some domains have subdomains with app-specific favicons
const retainSubdomainKeywords = ["google"];
const maxBookmarks = 5; // max number of bookmarks to display

const LinksDisplay = ({ bookmarksData, style }) => {
	if (bookmarksData.length < 1) return <Row className="bookmark-flexbox" />;

	return (
		<Row className="bookmark-flexbox" style={style}>
			{bookmarksData.slice(0, maxBookmarks).map((bookmark, i) => {
				if (!bookmark.url) return null;
				// Catch bookmarks folder that do not have url
				const url = bookmark.url;
				let domain = url.match("(?<=://)(.*?)(?=/)")[0];
				if (domain.split(".").length >= 3 && !domain.includes(retainSubdomainKeywords)) {
					domain = domain.split(".").slice(1).join(".");
				}
				return <CircleLink key={i} url={url} title={bookmark.title} domain={domain} />;
			})}
		</Row>
	);
};

// Checks for internet connection and any adblock interference
const ConnectionStatusPopup = () => {
	let [popup, setPopup] = useState(true);
	let [timedout, setTimedout] = useState(false);

	useEffect(() => {
		setTimeout(() => {
			setTimedout(true);
		}, 10000);
	}, []);

	const pvHasAdBlock = detectAdBlock();
	const hasAdBlock = pvHasAdBlock.value;
	const isOffline = !navigator.onLine; // pvHasAdBlock.error;
	const determining = !(pvHasAdBlock.resolved || pvHasAdBlock.error) && timedout; // determining what? This pop up seems to be on only when it is clearly online
	const showPopup = (hasAdBlock || isOffline) && popup;

	return showPopup ? (
		<div
			style={{
				background: "white",
				borderRadius: 10,
				left: "50%",
				top: "50%",
				transform: "translate(-50%, -50%)",
				width: 500,
				zIndex: 99999,
			}}
			className="shadow position-absolute text-center p-3 pt-4"
		>
			{hasAdBlock && !isOffline && !determining && (
				<>
					<h3 className="text-dark">It looks like you have AdBlock enabled</h3>
					<p>
						We can't raise money for charity without displaying ads. Please <a href="https://my.good-loop.com/allowlist">disable your adblocker</a> so Tabs for Good can work!
					</p>
				</>
			)}
			{isOffline && !determining && (
				<>
					<h3 className="text-dark">We can't find the internet :(</h3>
					<p>We couldn't load your Tabs for Good page. Check your connection.</p>
					<small>If your internet is working, contact support@good-loop.com!</small>
				</>
			)}
			{/* {determining && (
				<>
					<h3 className="text-dark">We're having trouble connecting</h3>
					<p>One moment...</p>
				</>
			)} */}
			<b style={{ position: "absolute", top: 10, right: 20, cursor: "pointer" }} onClick={() => setPopup(false)} role="button">
				X
			</b>
		</div>
	) : null;
};

/** Redirect to chosen search engine */
const doSearch = (e, engine) => {
	stopEvent(e);
	// NB: use window.parent to break out of the newtab iframe, otherwise ecosia objects
	const search = DataStore.getValue("widget", "search", "q");
	// Cancel search if empty (NB don't mess with this condition - eg '0' is falsy but still counts)
	if (search == null || search === "") return;
	window.parent.location = ENGINES[engine].url + encURI(search);
};

const tutorialPages = [
	<>
		<h2>Success!</h2>
		<p>
			Thanks for signing up to Tabs for Good!
			<br />
			You are now raising money for your favourite charity every time you open a new tab.
		</p>
	</>,
	<>
		<h2>It's your choice</h2>
		<p>You can choose the charity you want to support. We will send them 50% of the money from brands for their ads on Tabs for Good.</p>
	</>,
	<>
		<h2>Check our progress</h2>
		<p>See how much money we've raised so far! &#128578;</p>
	</>,
	<>
		<h2>Where the money comes from</h2>
		<p>We generate money by displaying ads at the bottom of each Tabs for Good window. You don't need to click on them for it to work.</p>
	</>,
	<>
		<h2>Your account</h2>
		<p>
			Change your <b>charity</b> and <b>search engine</b> here, under Tabs for Good. You can also see your account details.
		</p>
	</>,
	<>
		<h2>Explore the Loop</h2>
		<p>Find out more about Good-Loop and what more you can do for good at My-Loop.</p>
	</>,
	<>
		<h2>Customize your page</h2>
		<p>Make your Tabs For Good page yours! Change themes and layouts in here.</p>
	</>,
];

export default NewTabMainDiv;
