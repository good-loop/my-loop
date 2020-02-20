import React from 'react';
import CharityCard from '../cards/CharityCard';

const formatCharityData = data => {
	const dataKeys = Object.keys(data);
	return dataKeys.map((e, i) => {
		const charity = data[e];
		return { i, charity: charity, donationValue: charity.donated };
	});
};

const CharitiesSection = ({charities}) => {

	const charityObjectArray = formatCharityData(charities);
	const charityCardsArray = charityObjectArray.map(e => <CharityCard i={e.i} imageLeft={e.i % 2 === 0} charity={e.charity} donationValue={e.donationValue} />)

	return (
		<>
			{charityCardsArray}
		</>
	);
};

export default CharitiesSection;
