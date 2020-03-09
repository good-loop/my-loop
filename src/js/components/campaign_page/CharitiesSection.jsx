import React from 'react';
import CharityCard from '../cards/CharityCard';

const CharitiesSection = ({charities, donationsByCharity}) => {

	const charityCardsArray = charities.map((e, i) => {
		const donationValue = donationsByCharity[e.id] ? donationsByCharity[e.id].value : 0;
		return <CharityCard
			i={i}
			imageLeft={i % 2 === 0}
			charity={e}
			donationValue={donationValue}
		/>;
	});

	return (
		<>
			{charityCardsArray}
		</>
	);
};

export default CharitiesSection;
