import React from 'react';


const PageTitle = ({ title }) => {
    return (
    <div>
        <div className="title">{title}</div>
        <div className="content_separator"></div>
    </div>
    )
}

export default PageTitle;