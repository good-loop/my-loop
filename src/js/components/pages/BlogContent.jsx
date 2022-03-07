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

const formatDate = (date) => {
    const dateObj = new Date(date);
    const month = dateObj.toLocaleString('default', { month: 'short' });
    const day = dateObj.getUTCDate();
    const year = dateObj.getUTCFullYear();

    const newdate = month + " " + day + ", " + year;
    return newdate;
};

const BlogContent = ({blogPost, preview}) => {

    //const storeContent = DataStore.getUrlValue("content");
    const [msgContent, setMsgContent] = useState(null);
    const useContent = msgContent || (blogPost && blogPost.content);// || storeContent;
    
    const [msgDetails, setMsgDetails] = useState({});
    Object.assign(blogPost, msgDetails);

    useEffect (() => {
        // For portal editing, allows content to be edited while in an iframe without reloading
        window.addEventListener("message", event => {
            if (event.origin.includes('portal.good-loop.com')) {
                if (event.data.startsWith("content:")) {
                    setMsgContent(event.data.substr(8, event.data.length - 7));
                } else if (event.data.startsWith("details:")) {
                    setMsgDetails(JSON.parse(event.data.substr(8, event.data.length - 7)));
                }
            }
        });
        return () => {window.removeEventListener("message")}
    }, []);

    return <>
        <h1>{blogPost.title}</h1>
        <p className='leader-text mt-3 text-center'>{blogPost.subtitle}</p>
        <div className="d-flex flex-row justify-content-center align-items-center mt-3">
            <SignatureSVG name={blogPost.author} title={blogPost.authorTitle} href={blogPost.authorPic} className="signatureSVG" hideLogo/>
        </div>
        <PageCard className="pt-4">
            <p className="color-gl-dark-grey">
                {formatDate(blogPost.created)}&nbsp;&nbsp;&nbsp;&nbsp;{BlogPost.readTime(blogPost)} min Read
            </p>
            <hr/>
            <div className="blog-content mt-5">
                <style>{blogPost.customCSS}</style>
                <MDText source={useContent} linkOut/>
            </div>
        </PageCard>
    </>;
    
};

export default BlogContent;
export {formatDate};
