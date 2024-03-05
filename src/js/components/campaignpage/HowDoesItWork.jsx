import React, {useState} from 'react';

const HowDoesItWork = ({ nvertiserName, charities, ongoing, setCtaModalOpen, campaignId }) => {
	// possessive form - names with terminal S just take an apostrophe, all others get "'s"
	// EG Sharp's (brewery) ==> "Sharp's' video... " vs Sharp (electronics manufacturer) ==> "Sharp's video"
	const nvertiserNamePoss = nvertiserName ? (
		nvertiserName.includes("'s") ? (
			nvertiserName
		) : (
			nvertiserName.replace(/s?$/, match => ({ s: 's\'' }[match] || '\'s'))
		)
	) : null;

	let charityName;
	if (charities.length === 1) {
		charityName = charities[0].displayName || charities[0].name;
		if (charityName && charityName.startsWith("The ")) {
			charityName = charityName.replace("The ", "the ");
		}
	}

	return (
		<div className="bg-gl-light-pink py-5">
			<div className="container py-5">
				<h2 className="pb-5">How does it work?</h2>
				<div className="row mb-3 text-center align-items-start">
					<div className="col-md d-flex flex-column">
						<img src="/img/icons/Eye-red.svg" className="mb-3 w-50 align-self-center" alt="wrapped video" />
						<span id="how-does-it-work-1">
						1. {nvertiserNamePoss || "This"} video ad {ongoing ? "is" : "was"} ‘wrapped’ into Good-loop’s ethical ad frame, as you can see on the video below.
						</span>
					</div>
					<div className="col-md d-flex flex-column mt-5 mt-md-0">
						<img src="/img/icons/Lock-red.svg" className="mb-3 w-50 align-self-center" alt="choose to watch" />
						<span id="how-does-it-work-2">
						2. When the users choose to engage (by watching, swiping or clicking) they unlock{!ongoing && "ed"} a donation, funded by {nvertiserName}.
						</span>
					</div>
					<div className="col-md d-flex flex-column mt-5 mt-md-0">
						<img src="/img/icons/Hearth-red.svg" className="mb-3 w-50 align-self-center" alt="choose charity" />
						<span id="how-does-it-work-3">
						3. Once the donation {ongoing ? "is" : "was"} unlocked,
						{charities.length > 1 ? (
							" the user " + (ongoing ? "can" : "could") + " then choose which charity they " + (ongoing ? "want" : "wanted") + " to fund with 20% of the ad money. "
						) : (
							"20% of the ad money raised " + (ongoing ? "is" : "was") + " sent to " + (charityName || "charity") + "."
						)}
						</span>
					</div>
				</div>
				<button className="cta-modal-btn btn btn-primary text-uppercase" onClick={e => setCtaModalOpen(true)}>
					want to raise even more?
				</button>	
			</div>
			{/* <div className="flex-row justify-content-center align-items-center">
				<C.A className="btn btn-primary" href="/howitworks">Learn more</C.A>
			</div> */}
		</div>
	);
};

export default HowDoesItWork;