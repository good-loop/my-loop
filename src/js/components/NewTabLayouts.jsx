import React, { useState } from 'react';
import Misc from '../base/components/Misc';
import UserClaimControl, { setPersonSetting } from '../base/components/PropControls/UserClaimControl';
import { getClaimValue, getProfile } from '../base/data/Person';

const T4GLayoutSelector = ({...props}) => {

    // remove props that we control
    delete props.prop;
    delete props.type;
    delete props.options;
    delete props.labels;

    const onChange = (val) => {
        window.localStorage.setItem("t4g-layout", val);
    }

    return <UserClaimControl type="select" options={["min", "normal", "full"]} dflt="normal" labels={["Minimalist", "Normal", "Full Display"]} prop="t4g-layout" onChange={onChange} {...props}/>
};

const T4GThemePicker = () => {
	const person = getProfile().value;										// get person
	if(!person) return <Misc.Loading />;							

	let curTheme = getClaimValue({ person, key: "t4g-theme" });					// has user got a theme set?
	if(!curTheme) {				
		setPersonSetting({key:"t4g-theme", value:'.default'})								// if not, default
		window.localStorage.setItem("t4g-theme", '.default')
	}

	let curChar = getClaimValue({person, key: "charity"})					// get users chosen charity
	if(!curChar) curChar = '.default'										

	const onClick = (value) => {
		window.localStorage.setItem("t4g-theme", value)							// save theme selection locally
		setPersonSetting({key:"t4g-theme", value});									// save theme selection onto account
	};

	return (
		<div>
			<button className='btn btn-primary col-4' onClick={e => onClick('.dark')}>dark</button>
			<button className='btn btn-primary col-4' onClick={e => onClick('.light')}>light</button>
			<button className='btn btn-primary col-4' onClick={e => onClick('.nature')}>nature</button>
			<button className='btn btn-primary col-4' onClick={e => onClick(curChar)}>charity</button>
			<button className='btn btn-primary col-4' onClick={e => onClick('.default')}>default</button>
		</div>
	)
};

const getT4GThemeBackground = (theme) => {

    const [rand, setRand] = useState(Math.round(Math.random() * 9) + 1);

    const theme4Theme = {
        ".dark": {
            background: '/img/newtab/solid/dark.jpg',
            logo: '/img/newtab/logo/white.png'
        },
        ".light": {
            background: '/img/newtab/solid/light.jpg',
            logo: '/img/newtab/logo/black.png'
        },
        "dogs-trust": {
            background: '/img/newtab/charity/dogstrust/background1.jpg',
            logo: '/img/newtab/logo/black.png'
        },
        ".default": {
            background: '/img/newtab/default/gl-bg' + rand + '.jpg',
            logo: '/img/newtab/logo/white.png'
        }
    }

    let themeObj = theme4Theme[theme];
    if (!themeObj) themeObj = {
        background: '/img/newtab/default/gl-bg' + rand + '.jpg',
        logo: '/img/newtab/logo/white.png'
    };

    return themeObj;

};

/**
 * Get a user claim, using saved local values if loading to prevent flicker
 * @param {*} param0 
 * @returns 
 */
const getClaimLocal = ({person, key, dflt}) => {
    // get local copy first to compensate for load time
    let local = window.localStorage.getItem(key)
    if (!local) {
        // Default to full - so tutorial can display correctly
        window.localStorage.setItem(key, dflt);
        local = dflt;
    }
    // return person value if possible, otherwise use local option
    if (!person) person = getProfile().value;
    if (person) {
        const value = getClaimValue({ person, key });
        if (value) {
            // make sure local and server match
            window.localStorage.setItem(key, value);
            return value;
        }
    }
    return local;
}

const getT4GLayout = () => {
    return getClaimLocal({key:"t4g-layout", dflt:"full"});
}

const getT4GTheme = () => {
    return getClaimLocal({key:"t4g-theme", dlft:".default"});
}


export {T4GLayoutSelector, getT4GLayout, getT4GTheme, getT4GThemeBackground, T4GThemePicker};