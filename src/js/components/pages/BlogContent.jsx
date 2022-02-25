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

    useEffect (() => {
        window.addEventListener("message", event => {
            if (event.origin.includes('portal.good-loop.com')
                && event.data.startsWith("content:")) {
                setMsgContent(event.data.substr(8, event.data.length - 7));
            }
        });
        return () => {window.removeEventListener("message")}
    }, []);

    return <>
        <h1>{blogPost.title}</h1>
        <p className='leader-text mt-3 text-center'>{blogPost.subtitle}</p>
        <p className="text-center mt-4">{blogPost.author}</p>
        <PageCard>
            <p className="color-gl-dark-grey">
                {formatDate(blogPost.created)}&nbsp;&nbsp;&nbsp;&nbsp;{blogPost.readTime} min Read
            </p>
            <hr/>
            <div className="blog-content mt-5">
                <MDText source={useContent} linkOut/>
            </div>
        </PageCard>
    </>;
    
};

export default BlogContent;
export {formatDate};
