import React, { useEffect } from 'react';
import { Col, Container, Row } from 'reactstrap';
import Misc from '../../base/components/Misc';
import KStatus from '../../base/data/KStatus';
import { getDataItem } from '../../base/plumbing/Crud';
import C from '../../C';
import CharityLogo from '../CharityLogo';
import BG from '../../base/components/BG';
import { CurvePageCard, PageCard } from './CommonComponents';
import BlogContent from './BlogContent';
import DataStore from '../../base/plumbing/DataStore';
import { setFooterClassName } from '../Footer';

const BlogCard = ({page, title, subtitle, thumbnail, date, readTime}) => {

	return <Col md={4} xs={12} className="p-3">
		<C.A href={"/blog/" + page}>
			<div className="blog-card h-100">
				<BG src={thumbnail} className="w-100" ratio={60}/>
				<div className="blog-titles p-3">
					<h2 className="blog-title">{title}</h2>
					<p className="blog-subtitle">{subtitle}</p>
				</div>
				<div className="spacer"/>
				<div className="blog-info p-3">
					<Row>
						<Col xs={4}>
							{date}
						</Col>
						<Col xs={4}>
							{readTime} Read
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

	if (!pageUrl && !preview) {
		guts = <>
			<Row className="blog-card-row">
				{blogPages.map(blogPage =>
					<BlogCard
						title={blogPage.title}
						subtitle={blogPage.subtitle}
						date={blogPage.publishedDate || "Feb 17"}
						readTime={blogPage.readTime+" min" || "2 min"}
						thumbnail="/img/dew-grass.jpg"
					/>
				)}
			</Row>
		</>;
	} else if (preview) {
		guts = <BlogContent preview />
	} else {
		let pvBlogPost = getDataItem({ type: 'BlogPost', id:pageUrl, status });
		if (!pvBlogPost.resolved) {
			return <Misc.Loading />;
		}
		const blogPost = pvBlogPost.value;
		console.log("BLOG POST", blogPost);
		guts = <BlogContent content={blogPost.content}/>
	}

	return (<>
		{!undecorated &&
			<CurvePageCard
				color="white"
				bgImg="/img/blog/header.png"
				bgSize="cover"
				bgPosition="center 80%"
				bgClassName="bg-gl-desat-blue"
				topSpace={150}
				className="text-center pt-0"
			>
				<h1>Our Blog</h1>
				<p className='leader-text mt-5'>Grab a cuppa and have a read through our feel-good news, views and opinions</p>
			</CurvePageCard>
		}
		<PageCard className="blog-cards">
			{guts}
		</PageCard>
	</>);
};

export default BlogPage;
