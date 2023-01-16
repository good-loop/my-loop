import React, { useEffect } from 'react';
import {Row, Col, Container, Card} from 'reactstrap';
import { space } from '../../base/utils/miscutils';
import { assert } from '../../base/utils/assert';

export const GLHorizontal = ({className, style, children}) => {

    /*let uneatenSpace = 100;
    let notSpecifiedChildCount = 0;
    children.forEach(child => {
        if (child.props.basis) uneatenSpace -= child.props.basis;
        else notSpecifiedChildCount++;
    });

    const autoSpacedSize = uneatenSpace / notSpecifiedChildCount;*/

	return <Row noGutters className={space("glhorizontal", className)} style={style}>
		{children.map((child, i) => <Col key={i} style={{flexBasis:child.props.basis + "%", flexGrow:child.props.basis ? 0 : 1}}>{child}</Col>)}
	</Row>
}

export const GLVertical = ({className, children, ...props}) => {
	return <div className={space("glvertical", className)} {...props}>
		{children.map((child, i) => <div key={i} style={{flexBasis:child.props.basis + "%", flexGrow:child.props.basis ? 0 : 1}}>{child}</div>)}
	</div>;
}

/**
 * A 4x4 grid layout with adjustable divisions
 * Takes 4 children of any type and arranges them accordingly
 * 
 * @param v vertical division line position as percentage from top
 * @param h horizontal division line position as percentage from left
 */
export const GLGrid = ({v, h, className, style, children}) => {
	assert(children.length && children.length === 4, "GLGrid expects 4 children!");

	// Vertical division default to 50
	let vTop = v || v === 0 ? v : 50;
	let vBottom = 100 - vTop;
	vTop += "%";
	vBottom += "%";

	// Horizontal division default to flexbox default
	let hLeft = h || h === 0 ? h : null;
	hLeft += "%";
	let hRight = h || h === 0 ? (100 - h) : null;;
	hRight += "%";

	return <Container fluid className={space("glgrid", className)} style={style}>
		<Row noGutters style={{height:vTop}} className="glgrid-row">
			<Col style={{flexBasis:hLeft}} className="glgrid-col">
				{children[0]}
			</Col>
			<Col style={{flexBasis:hRight}} className="glgrid-col">
				{children[1]}
			</Col>
		</Row>
		<Row noGutters style={{height:vBottom}} className="glgrid-row">
			<Col style={{flexBasis:hLeft}} className="glgrid-col">
				{children[2]}
			</Col>
			<Col style={{flexBasis:hRight}} className="glgrid-col">
				{children[3]}
			</Col>
		</Row>
	</Container>
}

export const GLCard = ({className, children, ...props}) => {
	return <div className="glcard-outer">
		<Card className={space("glcard m-2", className)} {...props}>{children}</Card>
	</div>
}