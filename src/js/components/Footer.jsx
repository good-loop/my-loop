import React from 'react';
import Cookies from 'js-cookie';
import _ from 'lodash';
import { assert, assMatch } from 'sjtest';
import { XId, modifyHash, stopEvent, encURI, yessy } from 'wwutils';
import pivot from 'data-pivot';
import C from '../C';
import ServerIO from '../plumbing/ServerIO';
import DataStore from '../base/plumbing/DataStore';
import Person from '../base/data/Person';
import Misc from '../base/components/Misc';
import CardAccordion, {Card} from '../base/components/CardAccordion';
import ActionMan from '../plumbing/ActionMan';
import SimpleTable, {CellFormat} from '../base/components/SimpleTable';
import Login from 'you-again';
import {LoginLink, SocialSignInButton} from '../base/components/LoginWidget';
import {LoginToSee} from './Bits';
import {getProfile, getProfilesNow} from '../base/Profiler';
import ConsentWidget from './ConsentWidget';
import printer from '../base/utils/printer';
import DonationCard from './DonationCard';
import { Link, Element } from 'react-scroll';

const Footer = ({leftFooter, rightFooter, brandColorBgStyle}) => {
    return (<div className='footer' style={brandColorBgStyle}>
                <div className='leftFooter'>{leftFooter}</div>
                <div className='mainFooter'>        
                    Ads for Good is a Good-Loop Ltd ethical ad product.<br/>
                    &copy; 2017-18 Good-Loop <a href="mailto:daniel@good-loop.com?Subject=Good-Loop%20Portal" target="_top">Contact Us</a>
                    &nbsp;&nbsp;&nbsp; This web-app is open-source on <a target='_blank' href='https://github.com/good-loop/my-loop'>GitHub</a>.						
                </div>
                <div className='rightFooter'>{rightFooter}</div>
        </div>
        );
};

export default Footer;
