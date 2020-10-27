import React, { useState } from 'react';
import { Row, Col } from 'reactstrap';
import { space } from '../base/utils/miscutils';

/** Takes a list of items as its children and splits it into pages according to specified grid dimensions
@param {Number} rows how many rows each page has
@param {Number} cols how many columns each page has
*/ 
const Paginator = ({rows, cols, children, displayCounter=false, displayLoad=false}) => {

	const [pageNum, setPage] = useState(0);
	const itemsPerPage = rows * cols;
	const numPages = Math.ceil(children.length / itemsPerPage);
	let items = [];
	for (let i = pageNum * itemsPerPage; i < (pageNum + 1) * itemsPerPage && i < children.length; i++) {
		items.push(children[i]);
	}

	let pageBtns = [];
	for (let i = 0; i < numPages; i++) {
		pageBtns.push(<PageButton key={i} pageNum={i} setPage={setPage} selected={pageNum === i}>
			{(i+1) + "."}
		</PageButton>);
	}

	const page = <PageSection page={pageNum} rows={rows} cols={cols}>
		{items}
	</PageSection>;
	if (!page && children.length > 0) setPage(children[0].props.page);

	return (<div className="paginator">
		{displayCounter || (displayLoad && items.length === 0) ?
			<div className="paginator-counter">
				{!displayLoad || items.length > 0 ? "Showing " + items.length + " / " + children.length + " items"
				: "Loading..."}
			</div> : null}
		{page}
		<div className="paginator-controls flex-row justify-content-between w-50 mx-auto mt-5">
			<PageButton pageNum={pageNum-1<0 ? 0 : pageNum-1} setPage={setPage} disabled={pageNum-1<0}>
				Previous
			</PageButton>
			{pageBtns}
			<PageButton pageNum={pageNum+1>=numPages ? numPages - 1 : pageNum+1} setPage={setPage} disabled={pageNum+1>=numPages}>
				Next
			</PageButton>
		</div>
	</div>);

};

const PageButton = ({pageNum, setPage, selected=false, disabled=false, children}) => {

	const switchPage = e => {
		e.preventDefault();
		setPage(pageNum);
	};

	return (<>
		{disabled ?
			<span className={space("paginator-btn disabled", selected ? "selected" : "")}>
				{children}
			</span>
			:
			<a onClick={e => switchPage(e)} className={space("paginator-btn", selected ? "selected" : "")}>
				{children}
			</a>}
	</>);
};

const PageSection = ({page, rows, cols, className, children}) => {
	let colSize = Math.round(12 / rows);
	let numCols = 12 / colSize;
	let offset = numCols > rows;
	if (numCols < rows) {
		colSize--;
		numCols = 12 / colSize;
		offset = true;
	}
	// If the actual row count (numCols) is above rows, apply an even margin to all collumns which adds up in total
	// to the same width as the number of extra col divs
	const offsetVal = 100 / numCols / (rows - 1) * (numCols - rows);
	return (<div className={space("page-section", className)} id={"page-"+page}>
		<Row>
			{children.map((c,i) =>
				<Col md={colSize} style={i % rows !== 0 && offset ? {marginLeft:offsetVal+"%"} : {}}>
					{c}
				</Col>)}
		</Row>
	</div>);
};

export default Paginator;
