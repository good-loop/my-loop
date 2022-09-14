import React from 'react';
import UserClaimControl from '../base/components/PropControls/UserClaimControl';
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

const getT4GLayout = (person) => {
    // get local copy first to compensate for load time
    let locLayout = window.localStorage.getItem("t4g-layout")
    if (!locLayout) {
        // Default to full - so tutorial can display correctly
        window.localStorage.setItem("t4g-layout", "full");
        locLayout = "full";
    }
    // return person value if possible, otherwise use local option
    if (!person) person = getProfile().value;
    if (person) {
        const layout = getClaimValue({ person, key: "t4g-layout" });
        if (layout) {
            // make sure local and server match
            window.localStorage.setItem("t4g-layout", layout);
            return layout;
        }
    }
    return locLayout;
}

export {T4GLayoutSelector, getT4GLayout};