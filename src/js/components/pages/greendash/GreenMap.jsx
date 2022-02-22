import React, { useState } from 'react';
import { Button, Carousel, CarouselControl, CarouselItem, Modal, ModalBody } from 'reactstrap';
import DynImg from '../../../base/components/DynImg';
import { space, stopEvent } from '../../../base/utils/miscutils';

// Coefficients for Robinson projection (premultiplied to output percentages for positioning our map markers)
const robinsonX = [100, 99.86, 99.53999999999999, 99, 98.22, 97.3, 96, 94.27, 92.16, 89.62, 86.79, 83.5, 79.86, 75.97, 71.86, 67.32000000000001, 62.129999999999995, 57.220000000000006, 53.22];
const robinsonY = [-0, -3.1, -6.2, -9.3, -12.4, -15.5, -18.6, -21.7, -24.79, -27.855, -30.880000000000003, -33.845, -36.730000000000004, -39.515, -42.175000000000004, -44.68, -46.97, -48.805, -50];

/**
 * Turn lat/long in degrees into [x, y] in percent from international date line and north pole
 * Following https://en.wikipedia.org/wiki/Robinson_projection (but with linear interpolation because lazy)
 */
const toRobinson = (lat, long) => {
	const latIndex = Math.abs(lat) / 5;
	const beforeIndex = Math.floor(latIndex);
	const afterIndex = Math.ceil(latIndex);
	const interpFactor = latIndex - beforeIndex;
	const X1 = robinsonX[beforeIndex];
	const X2 = robinsonX[afterIndex];
	const X = X1 + ((X2 - X1) * interpFactor);
	const Y1 = robinsonY[beforeIndex];
	const Y2 = robinsonY[afterIndex];
	const Y = Math.sign(lat) * (Y1 + ((Y2 - Y1) * interpFactor));

	return [
		(X * long / 360) + 50,
		Y + 50
	]
};

window.toRobinson = toRobinson;


const mapProjects = [
	{
		placeName: 'Madagascar',
		desc: 'Reforestation projects in Madagascar',
		img: '/img/green/project-thumb-madagascar.jpg',
		marker: '/img/green/marker-tree.svg',
		arrow: 'top-right',
		lat: -19.43,
		long: 46.57,
		slides: [
			{
				img: '/img/green/slides/Madagascar-Slide-1-scaled.jpg',
				title: 'Reforestation in Madagascar: a global priority',
				text: 'Madagascar is home to species of plants and animals seen nowhere else on the planet. In recent years, Madagascar has experienced severe habitat loss, making it a global priority for biodiversity conservation.',
			},{
				img: '/img/green/slides/Madagascar-Slide-2-scaled.jpg',
				title: 'Restoring and protecting Madagascar\'s unique habitats',
				text: 'Via our planting partner Eden Reforestation Projects (Eden), we are helping restore and protect habitats vital to endemic species like the lemur.',
			},{
				img: '/img/green/slides/Madagascar-Slide-3-scaled.jpg',
				title: 'Supporting local communities in Madagascar',
				text: 'Via Eden, our tree planting is supporting communities and helping to alleviate extreme poverty by providing local people with consistent, fair-wage employment.',
			},{
				img: '/img/green/slides/Madagascar-Slide-4-scaled.jpg',
				title: 'Restoring and protecting dry deciduous forest, Northwest Madagascar',
				text: 'Madagascar\'s dry deciduous forests are one of the world\'s rarest and most biodiverse forest systems and they are severely threatened by deforestation. We are helping restore and protect native species forest for the future.',
			},{
				img: '/img/green/slides/Madagascar-Slide-5-scaled.jpg',
				title: 'Mangrove planting site, Northwest Madagascar',
				text: 'Mangrove deforestation has destabilised Madagascar\'s coastlines, meaning coastal communities are ever more vulnerable to severe weather events and the effects of climate change.',
			},{
				img: '/img/green/slides/Madagascar-Slide-6-scaled.jpg',
				title: 'Mangrove reforestation and restoration, Northwest Madagascar',
				text: 'Eden is supporting local communities to collect mangrove propagules and strategically plant millions of trees in coastal mangrove systems that have been hit by severe deforestation.',
			},{
				img: '/img/green/slides/Madagascar-Slide-7-scaled.jpg',
				title: 'Mangrove reforestation: Protecting coastline, ocean and planet',
				text: 'Mangrove restoration is helping protect against erosion while also improving ocean and coral reef health. Mangroves also have the powerful benefit of absorbing carbon from the atmosphere - up to 10 times more than forests*.',
				footnote: 'https://www.theguardian.com/environment/2021/nov/04/can-blue-carbon-make-offsetting-work-these-pioneers-think-so',
			}
		]
	},
	{
		placeName: 'Kenya',
		desc: 'Reforestation projects in Kenya',
		img: '/img/green/project-thumb-kenya.jpg',
		marker: '/img/green/marker-tree.svg',
		arrow: 'bottom-right',
		lat: 0.45,
		long: 38.14,
	},
	{
		placeName: 'Mozambique',
		desc: 'Reforestation projects in Mozambique',
		img: '/img/green/project-thumb-mozambique.jpg',
		marker: '/img/green/marker-tree.svg',
		arrow: 'right',
		lat: -17.58,
		long: 35.54,
	}
];


const ProjectSlides = ({project}) => {
	const [open, setOpen] = useState(false);
	const [currentSlide, setSlide] = useState(0);

	const openCarousel = e => {
		stopEvent(e);
		setOpen(true);
	}

	const prev = () => setSlide(currentSlide === 0 ? project.slides.length - 1 : currentSlide - 1);
	const next = () => setSlide(currentSlide >= project.slides.length - 1 ? 0 : currentSlide + 1);

	return <>
		<Button size="sm" className="project-more-info" onClick={openCarousel}>More Info</Button>
		<Modal className="green-map-modal" centered isOpen={open} toggle={() => setOpen(current => !current)}>
			<ModalBody className="project-slides">
				<Carousel activeIndex={currentSlide} previous={prev} next={next}>
					{project.slides.map((slide, i) => (
						<CarouselItem className="project-slide" key={`project-slide-${i}`}>
							<img className="slide-img" src={slide.img} />
							<h4 className="slide-title">{slide.title}</h4>
							<p className="slide-text">{slide.text}</p>
						</CarouselItem>
					))}
					<CarouselControl direction="prev" directionText="Previous" onClickHandler={prev} />
      		<CarouselControl direction="next" directionText="Next" onClickHandler={next} />
				</Carousel>
			</ModalBody>
		</Modal>
	</>
};


const ProjectMarker = ({project, active, setActive, index}) => {
	const coords = toRobinson(project.lat, project.long);
	const style = {left: `${coords[0]}%`, top: `${coords[1]}%`};
	const key = `${project.desc}: ${project.lat}N ${project.long}E`;
	return <>
		<div className={space('project-marker', `arrow-${project.arrow}`, active && 'active')} style={style} onClick={() => setActive(index)} key={key}>
			<img className="photo" src={project.img} />
			<div className="desc">
				{project.desc}
				{project.slides ? <ProjectSlides project={project} /> : null}
			</div>
			<svg viewBox="0 0 10 10" className="pointer pointer-top-left">
				<path d="M 0,10 H 10 L 5,0 Z" />
			</svg>
			<svg viewBox="0 0 10 10" className="pointer pointer-top-right">
				<path d="M 0,10 H 10 L 5,0 Z" />
			</svg>
			<svg viewBox="0 0 10 10" className="pointer pointer-right">
				<path d="M 0,0 V 10 L 10,5 Z" />
			</svg>
			<svg viewBox="0 0 10 10" className="pointer pointer-bottom-right">
				<path d="M 0,0 H 10 L 5,10 Z" />
			</svg>
			<svg viewBox="0 0 10 10" className="pointer pointer-bottom-left">
				<path d="M 0,0 H 10 L 5,10 Z" />
			</svg>
			<svg viewBox="0 0 10 10" className="pointer pointer-left">
				<path d="M 10,0 V 10 L 0,5 Z" />
			</svg>
		</div>
		<a className={space('project-marker-mobile', active && 'active')} style={style} onClick={() => setActive(index)} key={key + ' mobile'}>
			<img src="/img/green/tree.svg" />
		</a>
	</>;
};


const GreenMap = () => {
	// Projects map (mobile) - clicking a map dot should highlight it and the description 
	const [activeProject, setActiveProject] = useState(0);

	// TODO Mobile view should have pin markers only + list of descriptions below
	const projectMarkers = mapProjects.map((project, index) => (
		<ProjectMarker project={project} active={activeProject === index} index={index} setActive={setActiveProject} />
	));
	
	return <>
		<div className="projects-map">
			{/* TODO Transition curves should SOMEWHAT overlap the map image*/}
			<svg className="map-transition map-transition-top" viewBox="0 0 2560 400" version="1.1" xmlns="http://www.w3.org/2000/svg">
				<path d="M 0,0 V 324 C 1010.1193,660.09803 1815.6015,-393.13264 2560,192 V 0 Z" />
			</svg>
			<div className="map-markers">
				<img className="map-graphic" src="/img/green/world-map.svg" />
				{projectMarkers}
			</div>
			<svg className="map-transition map-transition-bottom" viewBox="0 0 2560 310" version="1.1" xmlns="http://www.w3.org/2000/svg">
				<path d="M 0,0 V 310 H 2560 V 34 C 1938.7303,249.1461 1390.9943,536.0566 0,0 Z" />
			</svg>
		</div>
		<div className="project-descriptions-mobile bg-greenmedia-darkcyan pt-4">
			{projectMarkers}
		</div>
	</>;
};


export default GreenMap;