import React, { useEffect } from 'react';
import { Col, Container, Row } from 'reactstrap';
import Misc from '../../base/components/Misc';
import KStatus from '../../base/data/KStatus';
import { getDataItem, setWindowTitle } from '../../base/plumbing/Crud';
import C from '../../C';
import CharityLogo from '../CharityLogo';
import BG from '../../base/components/BG';
import { CurvePageCard, PageCard } from './CommonComponents';
import BlogContent from './BlogContent';
import DataStore from '../../base/plumbing/DataStore';
import ActionMan from '../../base/plumbing/ActionManBase';
import SearchQuery from '../../base/searchquery';
import List from '../../base/data/List';
import { setFooterClassName } from '../Footer';
import { formatDate } from './BlogContent';
import BlogPost from '../../base/data/BlogPost';

const BlogCard = ({id, title, subtitle, thumbnail, date, readTime, status}) => {
	// Remove status if its PUBLISHED - neatens the URL
	const urlStatus = status && (status === KStatus.PUBLISHED ? "" : "?gl.status="+status);
	return <Col md={4} xs={12} className="p-3">
		<C.A href={"/blog/" + id + urlStatus}>
			<div className="blog-card h-100">
				<BG src={thumbnail} className="w-100" ratio={60}/>
				<div className="blog-titles p-3">
					<h2 className="blog-title">{title}</h2>
					<p className="blog-subtitle">{subtitle}</p>
				</div>
				<div className="spacer"/>
				<div className="blog-info p-3">
					<Row>
						<Col xs={6}>
							{formatDate(date)}
						</Col>
						<Col xs={6}>
							{readTime} min Read
						</Col>
					</Row>
				</div>
			</div>
		</C.A>
	</Col>
};

const BlogPage = () => {

	useEffect(() => {
		setFooterClassName("bg-white");
	}, []);

	// Is this for a page?
	const path = DataStore.getValue(['location', 'path']);
	let pageUrl = path[1];
	const preview = DataStore.getUrlValue('preview');
	const undecorated = DataStore.getUrlValue('undecorated');
	const status = DataStore.getUrlValue('gl.status') || DataStore.getUrlValue('status') || KStatus.PUBLISHED;

	let guts;
	let blogPost;

	if (!pageUrl) {
		const pvBlogPosts = fetchBlogPosts({status});
		const blogPosts = pvBlogPosts.value && List.hits(pvBlogPosts.value);
		guts = <>
			<h1>Our Blog</h1>
			<p className='leader-text mt-3 text-center'>Grab a cuppa and have a read through our feel-good news, views and opinions</p>
			<PageCard>
				<Row className="blog-card-row">
					{blogPosts && blogPosts.map(blogPost =>
						<BlogCard
							title={blogPost.title}
							subtitle={blogPost.subtitle}
							date={blogPost.created}
							readTime={BlogPost.readTime(blogPost)}
							thumbnail={blogPost.thumbnail}
							id={blogPost.id}
							status={status}
						/>
					)}
				</Row>
			</PageCard>
		</>;
	} else {
		let pvBlogPost = getDataItem({ type: 'BlogPost', id:pageUrl, status });
		if (!pvBlogPost.resolved) {
			return <Misc.Loading />;
		}
		blogPost = pvBlogPost.value;
		if (!blogPost) {
			guts = <div className="text-center">
				<h2>Oops - we can't find that!</h2>
				<p className="leader-text">The blog post you're looking for doesn't exist.</p>
				<C.A href="/blog">Return to all blogs</C.A>
			</div>;
		} else {
			setWindowTitle("My Good-Loop Blog: " + blogPost.title);
			guts = <BlogContent blogPost={blogPost} preview={preview}/>;
		}
	}

	return (<>
		{!undecorated &&
			<CurvePageCard
				color="white"
				bgImg={(blogPost && blogPost.headerImg) || "/img/blog/header.png"}
				bgSize="cover"
				bgPosition="center 80%"
				bgClassName="bg-gl-desat-blue"
				topSpace={150}
				className="text-center pt-0"
			>
			</CurvePageCard>
		}
		<div className="blog-cards">
			{guts}
		</div>
	</>);
};

/**
 * Initially returns [], and fills in array as requests load
 * @param {?String} query
 * @param {?KStatus} status
 * @returns PromiseValue(BlogPage[])
 */
const fetchBlogPosts = ({query, status=KStatus.PUBLISHED}) => {
	if (!query) query = "";
    // Campaigns with set agencies
    let sq = new SearchQuery(query);
    //let pvCampaigns = ActionMan.list({type: C.TYPES.Campaign, status, q});
    // Campaigns with advertisers belonging to agency
    let pvBlogPosts = ActionMan.list({type: C.TYPES.BlogPost, status, q:sq.query});

    return pvBlogPosts;
}

export default BlogPage;
