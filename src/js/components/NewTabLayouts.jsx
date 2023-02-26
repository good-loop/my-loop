import React, { useState } from 'react';
import { Button, Row, Col } from 'reactstrap';
import Misc from '../base/components/Misc';
import UserClaimControl, { getCharityObject, setPersonSetting } from '../base/components/propcontrols/UserClaimControl';
import { getClaimValue, getProfile } from '../base/data/Person';
import T4GTheme from '../base/data/T4GTheme';
import { mapNew } from '../base/utils/miscutils';

const THEMES = {
	// define default outside function - otherwise it will be recreated each update, causing rerenders
	".default": {
		backdropImages: mapNew(9, i => '/img/newtab/default/gl-bg' + (i+1) + '.jpg'),
		t4gLogo: '/img/newtab/logo/white.png',
		label: "Default"
	},
	".dark": {
		backgroundColor:"#000",
		t4gLogo: '/img/newtab/logo/white.png',
		label: "Dark"
	},
	".light": {
		backgroundColor:"#fefaef",
		t4gLogo: '/img/newtab/logo/black.png',
		label: "Light"
	},
};

// Excessive, but laid out like this in case we want to add extra info in future
const LAYOUTS = {
	min: {
		label: "Minimalist"
	},
	normal: {
		label: "Normal"
	},
	full: {
		label: "Full Display"
	}
};

const T4GLayoutPicker = () => {
	const person = getProfile().value; // get person
	if (!person) return <Misc.Loading />;

	let curLayout = getClaimValue({ person, key: "t4g-layout" }); // has user got a theme set?
	if (!curLayout) { 
		setPersonSetting({key:"t4g-layout", value:'full'}) // if not, default
		window.localStorage.setItem("t4g-layout", 'full')
	} 

	const onClick = (value) => {
		window.localStorage.setItem("t4g-layout", value) // save theme selection locally
		setPersonSetting({key:"t4g-layout", value}); // save theme selection onto account
	};

	const SelectButton = ({layout, label}) => {
		return <Col md={4} className="p-1">
			<Button color={curLayout === layout ? "primary" : "secondary"} className="w-100" onClick={e => onClick(layout)}>{label || LAYOUTS[layout].label}</Button>
		</Col>;
	}

	return (
		<Row>
			{Object.keys(LAYOUTS).map((layout, i) => {
				return <SelectButton key={i} layout={layout}/>;
			})}
		</Row>
	)
};

const T4GThemePicker = () => {
	const person = getProfile().value; // get person
	if (!person) return <Misc.Loading />;

	let curTheme = getClaimValue({ person, key: "t4g-theme" }); // has user got a theme set?
	if (!curTheme) {
		setPersonSetting({key:"t4g-theme", value:'.default'}); // if not, default
		window.localStorage.setItem("t4g-theme", '.default');
	}

	let curChar = getClaimValue({person, key: "charity"}) // get users chosen charity
	if (!curChar) curChar = '.default';

	const onClick = (value) => {
		window.localStorage.setItem("t4g-theme", value) // save theme selection locally
		setPersonSetting({key:"t4g-theme", value}); // save theme selection onto account
	};

	const SelectButton = ({theme, label}) => {
		return <Col md={4} className="p-1">
			<Button color={curTheme === theme ? "primary" : "secondary"} className="w-100" onClick={e => onClick(theme)}>{label || THEMES[theme].label}</Button>
		</Col>;
	}

	return (
		<Row>
			{Object.keys(THEMES).map((theme, i) => {
				if (!theme.startsWith('.')) return null;
				return <SelectButton key={i} theme={theme}/>;
			})}
			{(true || Object.keys(THEMES).includes(curChar)) && <SelectButton theme={".charity " + curChar} label="Charity"/>}
		</Row>
	);
};

const getT4GThemeData = (theme) => {

	let t = theme;
	let themeObj = THEMES[t];

	if (t && t.startsWith(".charity")) {
		// Format for charity themes is ".charity <charity-id>" - prompts us to look for the charity, but gives us an ID to use locally to avoid load times

		const person = getProfile().value; // get person
		if (!person) t = t.replace(".charity ", "");
		else {
			t = getClaimValue({person, key: "charity"}) || ".default" // get users chosen charitys
		}
		if (t) {
			let pvNgo = getCharityObject();
			let ngo = null;
			if (pvNgo) ngo = pvNgo.value || pvNgo.interim;
			if (ngo) {
				themeObj = ngo.t4gTheme;
			} else {
				// cant fetch it in time? use a locally stored copy of the object
				let themeJSON = window.localStorage.getItem("t4g-theme-obj");
				try {
					themeObj = JSON.parse(themeJSON);
				} catch (e) {
					// do nothing - give up
				}
			}
		}
	}

	if (themeObj && T4GTheme.valid(themeObj)) {
		// make sure to store a local copy
		window.localStorage.setItem("t4g-theme-obj", JSON.stringify(themeObj));
	} else {
		themeObj = THEMES[".default"]
		// Make sure to save the default - we dont want to cause flickers on every load
		window.localStorage.setItem("t4g-theme", ".default");
	}

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


export {getT4GLayout, getT4GTheme, getT4GThemeData, T4GThemePicker, T4GLayoutPicker};
