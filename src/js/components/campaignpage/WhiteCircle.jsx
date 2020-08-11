import React from 'react';

const WhiteCircle = ({width, children}) => {
    return (
        <div className="white-circle shadow" style={{width: (width && width ? width : "100%")}}>
            <div className="content">
                {children}
            </div>
        </div>
    )
}

export default WhiteCircle;