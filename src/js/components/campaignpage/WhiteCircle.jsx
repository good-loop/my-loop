import React from 'react';

const WhiteCircle = ({width, children, className}) => {
    return (
        <div className={"white-circle " + (className != undefined ? className : "")} style={(width != undefined ? {width:width} : {})}>
            <div className="content">
                {children}
            </div>
        </div>
    )
}

export default WhiteCircle;