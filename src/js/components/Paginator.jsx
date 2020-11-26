import React, { useState } from 'react';
import { Row, Col } from 'reactstrap';
import { space, isPortraitMobile } from '../base/utils/miscutils';

/** Takes a list of items as its children and splits it into pages according to specified grid dimensions
@param {Number} rows how many rows each page has
@param {Number} cols how many columns each page has
@param {?Number} pageButtonRange how many page numbers to display either side of "this page"
@param {?Number} rowsMD row number for mobile
@param {?Number} colsMD column number for mobile
@param {?Number} pageButtonRangeMD pageButtonRange for mobile
@param {?Boolean} displayCounter show the number of items and number per page
@param {?Boolean} displayLoad set the counter to "Loading..." when no items are present
@param {?String} textWhenNoResults text to show when there are no results. Does not show in place of "loading"
*/ 
const Paginator = ({rows, cols, rowsMD, colsMD, pageButtonRange, pageButtonRangeMD, children, displayCounter=false, displayLoad=false, textWhenNoResults}) => {
	if (isPortraitMobile() && rowsMD) rows = rowsMD;
	if (isPortraitMobile() && colsMD) cols = colsMD;
	if (isPortraitMobile() && pageButtonRangeMD) pageButtonRange = pageButtonRangeMD;
	const [pageNum, setPage] = useState(0);
	// Remember if we've had items or not, so we don't display loading again if we empty later
	const [hasLoadedItems, setLoadedItems] = useState(false);
	const itemsPerPage = rows * cols;
	const numPages = Math.ceil(children.length / itemsPerPage);
	let items = [];
	for (let i = pageNum * itemsPerPage; i < (pageNum + 1) * itemsPerPage && i < children.length; i++) {
		items.push(children[i]);
	}
	if (items.length > 0 && !hasLoadedItems) setLoadedItems(true);

	// Setup page button count, applying a limit and offset according to the pageButtonRange
	let pageBtns = [];
	let start = 0;
	let max = numPages;
	if (pageButtonRange) {
		start = pageNum - pageButtonRange;
		// If we're on the last page, make up for the lost end range
		start = pageNum === numPages - 1 ? start - 1 : start;
		// Don't go to page -1
		start = start < 0 ? 0 : start;
		
		max = pageNum + pageButtonRange + 1;
		// If we're on page 1, make up for the lost start range
		max = pageNum === 0 ? max + 1 : max;
		// Don't show more pages than exist
		max = max > numPages ? numPages : max;
	}
	for (let i = start; i < max; i++) {
		pageBtns.push(<PageButton key={i} pageNum={i} setPage={setPage} selected={pageNum === i}>
			{(i+1) + "."}
		</PageButton>);
	}

	const page = <PageSection page={pageNum} rows={rows} useMobileSizing={rowsMD || colsMD}>
		{items}
	</PageSection>;
	if (!page && children.length > 0) setPage(children[0].props.page);

	return (<div className="paginator">
		{displayCounter || (displayLoad && items.length === 0) ?
			<div className="paginator-counter">
				{!displayLoad || (items.length > 0 || hasLoadedItems) ? "Showing " + items.length + " / " + children.length + " items"
					: "Loading..."}
			</div> : null}
		{page}
		<div className={"paginator-controls flex-row justify-content-between" + (isPortraitMobile() ? "w-100" : "w-50") + " mx-auto mt-5"}>
			<PageButton pageNum={pageNum-1<0 ? 0 : pageNum-1} setPage={setPage} disabled={pageNum-1<0}>
				Previous
			</PageButton>
			{pageButtonRange ? <p className={start === 0 ? "invisible" : ""}>...</p> : null}
			{pageBtns}
			{pageButtonRange ? <p className={max === numPages ? "invisible" : ""}>...</p> : null}
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
			<span className={space("paginator-btn disabled text-muted", selected ? "selected" : "")}>
				{children}
			</span>
			:
			<a onClick={e => switchPage(e)} className={space("paginator-btn text-primary", selected ? "selected font-weight-bold" : "")}>
				{children}
			</a>}
	</>);
};

const PageSection = ({page, rows, useMobileSizing=false, className, children}) => {
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
				<Col key={i} md={colSize} xs={isPortraitMobile() && useMobileSizing? colSize : null} style={i % rows !== 0 && offset ? {marginLeft:offsetVal+"%"} : {}}>
					{c}
				</Col>)}
		</Row>
	</div>);
};

export default Paginator;
