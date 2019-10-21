import React from 'react';

const StoryCard = () => {

	return (
		<div className="story-card-container" style={{width:'20%'}}>
			<img src="https://via.placeholder.com/350x250" alt="placeholder image"/>
			<div className="story-card-text">
				<h3>Article title</h3>
				<p>Here an extract of the article or page. It should be brief enough, maybe even cropping itself with [...] followed by &lsquo;read more&lsquo; link.</p>
			</div>
		</div>
	);
};

export default StoryCard;
