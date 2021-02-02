import React from 'react';

const NewTabAds = () => {
    return (
        <div id="tab-ads" class="position-absolute w-100 flex-row" style="bottom:0; height: 115px; padding: 10px">
            <script type="text/javascript">
                // HACK - ads wont serve in iframe because it sees empty content before webpack is loaded.
                // This tricks AdSense into monitoring the parent instead, which it is happy with
                // https://geoland.org/2007/01/adsense-in-iframe/
                const originalDocument = document;
                document=parent.document;
            </script>
            <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
            {/* Tabs for Good bottom display */}
            <ins class="adsbygoogle"
                style="display:inline-block;width:728px;height:90px"
                data-ad-client="ca-pub-9448086783562205"
                data-ad-slot="5736021145"></ins>
            <script>
                (adsbygoogle = window.adsbygoogle || []).push({});
            </script>
            <script type="text/javascript">
                document=originalDocument;
            </script>
        </div>
    );
}

export default NewTabAds;