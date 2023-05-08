import React, { useEffect, useMemo } from 'react';
import {Row, Col, Container, Card, CardHeader, CardBody} from 'reactstrap';
import { space, isPortraitMobile } from '../../base/utils/miscutils';
import { assert } from '../../base/utils/assert';
import DataStore from '../../base/plumbing/DataStore'
import CloseButton from '../../base/components/CloseButton';
import C from '../../C';

// TODO it'd be nice to do Modal widgets without global storage
const MODAL_PATH = ['widget', 'GLModalCards'];
const MODAL_LIST_PATH = MODAL_PATH.concat("list");
const MODAL_BACKDROP_PATH = MODAL_PATH.concat("backdrop");
const LOADED_PATH = MODAL_PATH.concat("loaded");

/**
 * Wraps everything into a horizontal flow. Any child with a "basis" prop will be given that priority as a percentage, e.g. basis={50}
 * 
 * @param {String} collapse the bootstrap breakpoint to break flow on
 */
export const GLHorizontal = ({collapse, className, style, children}) => {

    /*let uneatenSpace = 100;
    let notSpecifiedChildCount = 0;
    children.forEach(child => {
        if (child.props.basis) uneatenSpace -= child.props.basis;
        else notSpecifiedChildCount++;
    });

    const autoSpacedSize = uneatenSpace / notSpecifiedChildCount;*/

	if (!Array.isArray(children)) children = [children];

	return <Row noGutters className={space("glhorizontal", collapse?"glhorizontal-"+collapse:"", className)} style={style}>
		{children.map((child, i) => {
			// Special case for overlays - they must not interfere with layout, so make no wrapper
			if (!child || child.type === GLModalCard) return child;
			return <Col key={i} style={{flexBasis:child.props.basis + "%", flexGrow:child.props.basis ? 0 : 1}}>{child}</Col>
		})}
	</Row>
}

/**
 * Wraps everything into a vertical flow. Any child with a "basis" prop will be given that priority as a percentage, e.g. basis={50}
 * 
 */
export const GLVertical = ({className, children, ...props}) => {
	if (!Array.isArray(children)) children = [children];
	return <div className={space("glvertical", className)} {...props}>
		{children.map((child, i) => {
			// Special case for overlays - they must not interfere with layout, so make no wrapper
			if (!child || child.type === GLModalCard) return child;
			return <div key={i} style={{flexBasis:child.props.basis + "%", flexGrow:child.props.basis ? 0 : 1}}>{child}</div>
		})}
	</div>;
}

/**
 * A card content wrapper, with configurable behaviour for opening modals.
 * 
 * @param {Object} obj
 * @param {?string} obj.className className passthrough
 * @param {?boolean} obj.noPadding remove padding from the card content
 * @param {?boolean} obj.noMargin remove margin wrapper from outside the card
 * @param {?*} obj.modalContent if specified, will make card clickable to display this content in the GLModalCard specified (see below)
 * @param {?*} obj.modalTitle the title to put in the modal header
 * @param {?*} obj.modalHeader content to put in the modal header
 * @param {?*} obj.modalHeaderImg background image for the modal header
 * @param {?*} obj.modalClassName className for modal
 * @param {?Object} obj.modal package object for all the above parameters
 * @param {?String} obj.modalId the ID of the GLModalCard to use in displaying
 * @param {?Boolean} obj.modalPrioritize if this GLModalCard is opened while others are already open, force close them (they remain open by default)
 * @param {?String} obj.href make this card a link
 * @param {?} obj.children
 */
export const GLCard = ({noPadding, noMargin, className, style, modalContent, modalTitle, modalId, modalHeader, modalHeaderImg, modalPrioritize, modalClassName, modal, children, href, ...props}) => {

	const modalObj = {
		content: modalContent, 
		title: modalTitle,
		header: modalHeader,
		headerImg: modalHeaderImg,
		className: modalClassName,
		...modal
	};

	const openModal = () => {
		assert(modalId, "No ID specified for which overlay modal to use!");
		
		DataStore.setValue(MODAL_LIST_PATH.concat(modalId), modalObj);

		// manually close all other modals if prioritized first
		// Only space for one modal on mobile, so always close
		if (modalPrioritize || isPortraitMobile()) modalToggle();
		modalToggle(modalId);
	}

	const loaded = DataStore.getValue(LOADED_PATH);

	let cardContents = <Card className={space("glcard", !noMargin?"m-2":"", modalContent?"glcardmodal":"", className)} onClick={modalContent && openModal} {...props}>
		{noPadding? children
		: <CardBody>{children}</CardBody>}
	</Card>;

	if (href) {
		cardContents = <C.A className="glcard-link" href={href} onClick={() => modalToggle()}>{cardContents}</C.A>
	}

	return noMargin ? cardContents
	: <div className="glcard-outer" style={style}>
		{cardContents}	
	</div>;
}

/**
 * Opens and closes modals. If given an ID, will toggle that modal. If not, it will force close all modals.
 * @param {String} id 
 */
export const modalToggle = (id) => {
	if (id) {
		// Toggle specific modal
		const path = MODAL_LIST_PATH.concat(id);
		const open = DataStore.getValue(path.concat("open"));
		DataStore.setValue(path.concat("open"), !open);

		// Check if any modals are still open, and if not close the backdrop
		let modalObjs = DataStore.getValue(MODAL_LIST_PATH) || {};
		const anyModalOpen = Object.values(modalObjs).map(obj => obj.open).reduce((prev, cur) => prev || cur);
		DataStore.setValue(MODAL_BACKDROP_PATH, anyModalOpen);
	} else {
		// If none specified, that means the backdrop has been clicked - so close everything
		let modalObjs = DataStore.getValue(MODAL_LIST_PATH) || {};
		const modalIds = Object.keys(modalObjs);
		modalIds.forEach(id => {
			modalObjs[id].open = false;
		});
		DataStore.setValue(MODAL_LIST_PATH, modalObjs);
		DataStore.setValue(MODAL_BACKDROP_PATH, false);
	}
}

/**
 * TODO refactor to more "standard" react. This is a mix of function and tag.
 */
export const openAndPopulateModal = ({id, content, title, header, headerImg, headerClassName, className, prioritized}) => {
	assert(id, "Must be given a modal ID to open!");
	// Force close other modals first
	if (prioritized) modalToggle();
	DataStore.setValue(MODAL_LIST_PATH.concat(id), {content, title, header, headerImg, headerClassName, className});
	modalToggle(id);
}

export const markPageLoaded = (loaded) => {
	DataStore.setValue(LOADED_PATH, loaded);
}

/**
 * A modal form of GLCard. Will not be visible and change nothing in the layout, but when opened will occupy the space it is assigned to as if it was in the layout, while remaining on top.
 * 
 * @param {String} id 
 */
export const GLModalCard = ({className, id}) => {

	const path = MODAL_LIST_PATH.concat(id);
	const open = DataStore.getValue(path.concat("open"));

	const Content = DataStore.getValue(path.concat("content"));
	const title = DataStore.getValue(path.concat("title"));
	const Header = DataStore.getValue(path.concat("header"));
	const headerImg = DataStore.getValue(path.concat("headerImg"));
	const headerClassName = DataStore.getValue(path.concat("headerClassName"));
	const storedClassName = DataStore.getValue(path.concat("className"));

	useEffect(() => {
		DataStore.setValue(MODAL_LIST_PATH.concat(id), {open:false});
	}, [id]);

	const headerStyle = headerImg && {
		backgroundImage: "url('"+headerImg+"')",
		backgroundPosition: "center"
	};

	return open ? <>
		<div className={space('glmodal', storedClassName, className)} id={id}>
			<GLCard noPadding className="glmodal-inner">
				<CardHeader style={headerStyle} className={"glmodal-header " + headerClassName}>
					<CloseButton className="white-circle-bg" onClick={() => modalToggle(id)}/>
					{title && <h4 className='glmodal-title'>{title}</h4>}
					{Header && <Header/>}
				</CardHeader>
				<CardBody>
					<Content/>
				</CardBody>
			</GLCard>
		</div>
	</>: null;

};

/**
 * Backdrop for all GLModalCards on a page. Closes all modals on click.
 *  
 */
export const GLModalBackdrop = ({className}) => {
	const open = DataStore.getValue(MODAL_BACKDROP_PATH);
	return open ? <div onClick={() => modalToggle()} className='glmodal-backdrop'/> : null;
}
