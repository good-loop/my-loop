import React, { useEffect } from 'react';
import {Row, Col, Container, Card, CardHeader, CardBody} from 'reactstrap';
import { space } from '../../base/utils/miscutils';
import { assert } from '../../base/utils/assert';
import DataStore from '../../base/plumbing/DataStore'
import CloseButton from '../../base/components/CloseButton';

const MODAL_PATH = ['widget', 'GLModalCards'];
const MODAL_LIST_PATH = MODAL_PATH.concat("list");
const MODAL_BACKDROP_PATH = MODAL_PATH.concat("backdrop");

export const GLHorizontal = ({collapse, className, style, children}) => {

    /*let uneatenSpace = 100;
    let notSpecifiedChildCount = 0;
    children.forEach(child => {
        if (child.props.basis) uneatenSpace -= child.props.basis;
        else notSpecifiedChildCount++;
    });

    const autoSpacedSize = uneatenSpace / notSpecifiedChildCount;*/

	return <Row noGutters className={space("glhorizontal", collapse?"glhorizontal-"+collapse:"", className)} style={style}>
		{children.map((child, i) => {
			// Special case for overlays - they must not interfere with layout, so make no wrapper
			if (child.type === GLModalCard) return child;
			return <Col key={i} style={{flexBasis:child.props.basis + "%", flexGrow:child.props.basis ? 0 : 1}}>{child}</Col>
		})}
	</Row>
}

export const GLVertical = ({className, children, ...props}) => {
	return <div className={space("glvertical", className)} {...props}>
		{children.map((child, i) => {
			// Special case for overlays - they must not interfere with layout, so make no wrapper
			if (child.type === GLModalCard) return child;
			return <div key={i} style={{flexBasis:child.props.basis + "%", flexGrow:child.props.basis ? 0 : 1}}>{child}</div>
		})}
	</div>;
}

export const GLCard = ({noPadding, className, style, modalContent, modalTitle, modalId, children, ...props}) => {

	const openModal = () => {
		assert(modalId, "No ID specified for which overlay modal to use!");
		DataStore.setValue(MODAL_LIST_PATH.concat(modalId), {
			open: true,
			content: modalContent, 
			title: modalTitle
		});
	}

	return <div className="glcard-outer" style={style}>
		<Card className={space("glcard m-2", modalContent?"glcardmodal":"", className)} onClick={modalContent && openModal} {...props}>
			{noPadding? children
			: <CardBody>{children}</CardBody>}
		</Card>
	</div>;
}

const modalToggle = (id) => {
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

export const GLModalCard = ({className, id}) => {

	const path = MODAL_LIST_PATH.concat(id);
	const open = DataStore.getValue(path.concat("open"));

	const content = DataStore.getValue(path.concat("content"));
	const title = DataStore.getValue(path.concat("title"));

	useEffect(() => {
		DataStore.setValue(MODAL_LIST_PATH.concat(id), {open:false});
	}, [id]);

	return open ? <>
		<div className='glmodal'>
			<GLCard noPadding>
				<CardHeader>
					<CloseButton onClick={() => modalToggle(id)}/>
					<h4>{title}</h4>
				</CardHeader>
				<CardBody>
					{content}
				</CardBody>
			</GLCard>
		</div>
	</>: null;

};

export const GLModalBackdrop = ({className}) => {
	const open = DataStore.getValue(MODAL_BACKDROP_PATH);
	return open ? <div onClick={() => modalToggle()} className='glmodal-backdrop'/> : null;
}
