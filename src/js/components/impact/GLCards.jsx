import React, { useEffect } from 'react';
import {Row, Col, Container, Card, CardHeader, CardBody} from 'reactstrap';
import { space } from '../../base/utils/miscutils';
import { assert } from '../../base/utils/assert';
import DataStore from '../../base/plumbing/DataStore'
import CloseButton from '../../base/components/CloseButton';

const MODAL_PATH = ['widget', 'HalfPageWidget'];

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
		DataStore.setValue(MODAL_PATH.concat(modalId), {
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

export const GLModalCard = ({className, id}) => {

	const path = MODAL_PATH.concat(id);
	const open = DataStore.getValue(path.concat("open"));
	const toggle = () => {
		DataStore.setValue(path.concat("open"), !open);
		// clear content if about to close
		if (open) DataStore.setValue(path.concat("content"), null);
	}

	const content = DataStore.getValue(path.concat("content"));
	const title = DataStore.getValue(path.concat("title"));

	return open ? <>
		<div onClick={toggle} className='glmodal-backdrop'/>
		<div className='glmodal'>
			<GLCard noPadding>
				<CardHeader>
					<CloseButton onClick={toggle}/>
					<h4>{title}</h4>
				</CardHeader>
				<CardBody>
					{content}
				</CardBody>
			</GLCard>
		</div>
	</>: null;

};
