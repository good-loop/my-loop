import React, { Children, useEffect, useMemo } from 'react';
import _ from 'lodash';
import {Row, Col, Container, Card, CardHeader, CardBody} from 'reactstrap';
import { space, isPortraitMobile } from '../../base/utils/miscutils';
import { assert } from '../../base/utils/assert';
import DataStore from '../../base/plumbing/DataStore'
import CloseButton from '../../base/components/CloseButton';
import C from '../../C';


// TODO it'd be nice to do Modal widgets without global storage
const MODAL_PATH = ['widget', 'GLModalCards'];
const MODAL_LIST_PATH = [...MODAL_PATH, 'list'];
const MODAL_BACKDROP_PATH = [...MODAL_PATH, 'backdrop'];
const LOADED_PATH = [...MODAL_PATH, 'loaded'];


/**
 * Common code for HDivision and VDivision.
 */
function CommonDivision({child, i, Tag}) {
	// Special case for overlays - they must not interfere with layout, so make no wrapper
	if (!child || child.type === GLModalCard) return child;
	const style = {
		flexBasis: `${child.props.basis}%`,
		flexGrow: child.props.basis ? 0 : 1,
	};
	return <Tag key={i} style={style}>{child}</Tag>;
}


/** Child element of GLHorizontal */
const HDivision = props => <CommonDivision {...props} Tag={Col} />


/** Child element of GLVertical */
const VDivision = props => <CommonDivision {...props} Tag="div" />


/**
 * Wraps everything into a horizontal flow. Any child with a "basis" prop will be given that priority as a percentage, e.g. basis={50}
 * 
 * @param {String} collapse the bootstrap breakpoint to break flow on
 */
export const GLHorizontal = ({collapse, className, style, children}) => (
	<Row noGutters className={space('glhorizontal', collapse && `glhorizontal-${collapse}`, className)} style={style}>
		{Children.map(children, (child, i) => <HDivision i={i} child={child} />)}
	</Row>
);


/**
 * Wraps everything into a vertical flow. Any child with a "basis" prop will be given that priority as a percentage, e.g. basis={50}
 */
export const GLVertical = ({className, children, ...props}) => (
	<div className={space('glvertical', className)} {...props}>
		{Children.map(children, (child, i) => <VDivision i={i} child={child} />)}
	</div>
);


/**
 * A card content wrapper, with configurable behaviour for opening modals.
 * 
 * @param {object} obj
 * @param {string} [obj.className] className passthrough
 * @param {boolean} [obj.noPadding] remove padding from the card content
 * @param {boolean} [obj.noMargin] remove margin wrapper from outside the card
 * @param {*} [obj.modalContent] if specified, will make card clickable to display this content in the GLModalCard specified (see below)
 * @param {*} [obj.modalTitle] the title to put in the modal header
 * @param {*} [obj.modalHeader] content to put in the modal header
 * @param {*} [obj.modalHeaderImg] background image for the modal header
 * @param {*} [obj.modalClassName] className for modal
 * @param {object} [obj.modal] package object for all the above parameters
 * @param {string} [obj.modalId] the ID of the GLModalCard to use in displaying
 * @param {boolean} [obj.modalPrioritize] if this GLModalCard is opened while others are already open, force close them (they remain open by default)
 * @param {String} [obj.href] make this card a link
 * @param {?} [obj.children]
 */
export const GLCard = ({noPadding, noMargin, className, style, modalContent, modalTitle, modalId, modalHeader, modalHeaderImg, modalPrioritize, modalClassName, modal, children, href, onClick, ...props}) => {
	const modalObj = {
		Content: modalContent,
		title: modalTitle,
		Header: modalHeader,
		headerImg: modalHeaderImg,
		storedClassName: modalClassName,
		...modal
	};

	const onClickCard = e => {
		onClick && onClick(e);
		if (modalContent) {
			assert(modalId, "No ID specified for which overlay modal to use!");

			DataStore.setValue(MODAL_LIST_PATH.concat(modalId), modalObj);
			// manually close all other modals if prioritized first
			// Only space for one modal on mobile, so always close
			if (modalPrioritize || isPortraitMobile()) modalToggle();
			modalToggle(modalId);
		}
	}

	let cardContents = (
		<Card className={space('glcard', !noMargin && 'm-2', modalContent && 'glcardmodal', className)} onClick={onClickCard} {...props}>
			{noPadding ? children : <CardBody>{children}</CardBody>}
		</Card>
	);

	if (href) {
		cardContents = <C.A className="glcard-link" href={href} onClick={() => modalToggle()}>{cardContents}</C.A>
	}

	return noMargin ? cardContents : (
		<div className="glcard-outer" style={style}>
			{cardContents}
		</div>
	);
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
		const usesOwnBackdrop = DataStore.getValue(path.concat("usesOwnBackdrop"));
		DataStore.setValue(path.concat("open"), !open);

		// Check if any modals are still open, and if not close the backdrop
		let modalObjs = DataStore.getValue(MODAL_LIST_PATH) || {};
		const anyModalOpen = Object.values(modalObjs).map(obj => obj.open).reduce((prev, cur) => prev || cur);
		if (!usesOwnBackdrop) DataStore.setValue(MODAL_BACKDROP_PATH, anyModalOpen);
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
export const openAndPopulateModal = ({id, Content, title, Header, headerImg, headerClassName, storedClassName, prioritized}) => {
	assert(id, "Must be given a modal ID to open!");
	// Force close other modals first
	if (prioritized) modalToggle();
	// Preserve static properties
	const usesOwnBackdrop = DataStore.getValue(MODAL_LIST_PATH.concat(id, "usesOwnBackdrop"));
	const modalProps = {Content, title, Header, headerImg, headerClassName, storedClassName, usesOwnBackdrop};
	//console.log("MODAL OBJ", modalObj);
	DataStore.setValue(MODAL_LIST_PATH.concat(id), modalProps);
	modalToggle(id);
}


export const markPageLoaded = loaded => DataStore.setValue(LOADED_PATH, loaded);


/**
 * A modal form of GLCard. Will not be visible and change nothing in the layout, but when opened will occupy the space it is assigned to as if it was in the layout, while remaining on top.
 * 
 * @param {String} id 
 * @param {?Boolean} useOwnBackdrop create and use a new backdrop instead of using the global one
 */
export const GLModalCard = ({id, useOwnBackdrop, ...props}) => {
	const path = [...MODAL_LIST_PATH, id];
	const storeProps = DataStore.getValue(path);

	useEffect(() => {
		DataStore.setValue(path, {open: false, usesOwnBackdrop:useOwnBackdrop}, false);
	}, [id]);
	if (!storeProps?.open) return null;

	console.log("STORE PROPS", storeProps);

	return <ModalCardOpen {...storeProps} {...props} id={id} />;
};


function ModalCardOpen({ id, title, Content, Header, storedClassName, className, headerImg, headerClassName, usesOwnBackdrop }) {
	// Register listener to catch ESC keypress and close
	useEffect(() => {
		const keyListener = e => (e?.key === 'Escape' && modalToggle(id));
		document.addEventListener('keydown', keyListener);
		return () => document.removeEventListener('keydown', keyListener);
	}, []);

	const headerStyle = headerImg && {
		backgroundImage: `url("${headerImg}")`,
		backgroundPosition: 'center'
	};

	return <>
		{usesOwnBackdrop ? <GLModalBackdrop forceShow id={id}/> : null}
		<div className={space('glmodal', storedClassName, className)} id={id}>
			<GLCard noPadding className="glmodal-inner">
				<CardHeader style={headerStyle} className={space('glmodal-header', headerClassName)}>
					<CloseButton className="white-circle-bg" onClick={() => modalToggle(id)}/>
					{title && <h4 className='glmodal-title'>{title}</h4>}
					{Header}
				</CardHeader>
				<CardBody>
					{Content}
				</CardBody>
			</GLCard>
		</div>
	</>;
}


/**
 * Backdrop for all GLModalCards on a page. Closes all modals on click.
 */
export const GLModalBackdrop = ({className, forceShow, id}) => {
	const open = forceShow || DataStore.getValue(MODAL_BACKDROP_PATH);
	return open ? <div onClick={() => modalToggle(id)} className="glmodal-backdrop" /> : null;
};
