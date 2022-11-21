import React, { useState, useEffect, useRef } from 'react';
import { Col, Container, Row } from 'reactstrap';
import Misc from '../../base/components/Misc';
import KStatus from '../../base/data/KStatus';
import { getDataItem } from '../../base/plumbing/Crud';
import C from '../../C';
import CharityLogo from '../CharityLogo';
import BG from '../../base/components/BG';
import { CurvePageCard, PageCard } from './CommonComponents';
import MDText from '../../base/components/MDText';
import DataStore from '../../base/plumbing/DataStore';
import SignatureSVG from '../../base/components/SignatureSVG';
import BlogPost from '../../base/data/BlogPost';
import LivePreviewable from '../../base/components/LivePreviewable';

const formatDate = (date) => {
	const dateObj = new Date(date);
	const month = dateObj.toLocaleString('default', { month: 'short' });
	const day = dateObj.getUTCDate();
	const year = dateObj.getUTCFullYear();

	const newdate = month + ' ' + day + ', ' + year;
	return newdate;
};

/**
 * Display a blog post
 * @param {Object} blogPost
 */
const BlogContent = ({ blogPost }) => {
	return <LivePreviewable object={blogPost} Child={BlogContentChild} />;
};

/**
 * Display a blog post. Wrapped in a LivePreviewable
 */
const BlogContentChild = ({ object: blogPost }) => {
	return (
		<>
			<h1>{blogPost.title}</h1>
			<p className='leader-text mt-3 text-center'>{blogPost.subtitle}</p>
			<div className='d-flex flex-row justify-content-center align-items-center mt-3'>
				<SignatureSVG
					name={blogPost.author}
					title={blogPost.authorTitle}
					pronouns={blogPost.authorPronouns}
					href={blogPost.authorPic}
					className='signatureSVG'
					hideLogo
				/>
			</div>
			<PageCard className='pt-4'>
				<p className='color-gl-dark-grey'>
					{formatDate(blogPost.created)}&nbsp;&nbsp;&nbsp;&nbsp;{BlogPost.readTime(blogPost)} min Read
				</p>
				<hr />
				<div className='blog-content mt-5'>
					<style>{blogPost.customCSS}</style>
					<MDText source={blogPost.content} linkOut />
				</div>
			</PageCard>
		</>
	);
};

export default BlogContent;
export { formatDate };
