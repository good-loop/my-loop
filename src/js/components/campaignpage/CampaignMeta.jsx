import React from 'react';

const CampaignMeta = ({campaignPage, nvertiserName}) => {
    const nvertiserNameNoTrail = nvertiserName.replace(/\'s$/g, "");
    return (
        <>
            <meta property="og:title" content={nvertiserNameNoTrail + "'s Good-Loop Impact"} />
            <meta property="og:type" content="article" />
            <meta property="og:url" content={window.location.href.replace(/(\#|\?).*$/g, "")}/>
            {// TODO: replace test domain with production domain
            }
            <meta property="og:image" content={campaignPage.bg ? campaignPage.bg : "https://testmy.good-loop.com/img/redcurve.svg"} />
            <meta property="og:site_name" content={nvertiserName + ": My-Loop"} />
            <meta property='og:description' content={"See " + nvertiserNameNoTrail + "'s impact from Good-Loop ethical advertising"} />
            
            <meta property="article:tag" content="Good-Loop" />
            <meta property="article:tag" content="advertising" />
            <meta property="article:tag" content="charity" />
            <meta property="article:tag" content="impact" />
            <meta property="article:tag" content={nvertiserName} />
            <meta property="article:author" content={"Good-Loop with " + {nvertiserName}} />

            <meta name='twitter:card' content='$description'/>
            <meta name='twitter:site' content='Good-Loop'/>
            <meta name='twitter:title' content='$title'/>
            <meta name='twitter:description' content='$description'/>
            <meta name='twitter:image' content='https://good-loop.com/$image'/>
            <meta name='twitter:creator' content='@goodloophq'/>
        </>
    )

}

export default CampaignMeta;