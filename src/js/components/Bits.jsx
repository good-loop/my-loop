import React from 'react';
import Login from 'you-again';
import {LoginLink, SocialSignInButton} from '../base/components/LoginWidget';

const LoginToSee = ({desc}) => <div>Please login to see {desc||'this'}. <LoginLink className='btn btn-default' /></div>;

export {LoginToSee};
