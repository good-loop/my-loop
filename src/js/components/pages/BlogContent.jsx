import React from 'react';
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

const BlogContent = ({content}) => {

    const storeContent = DataStore.getUrlValue("content");
    const useContent = content || storeContent;

    return <div className="blog-content">
        <MDText source={useContent} linkOut/>
    </div>;
    
};

export default BlogContent;
