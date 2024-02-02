<#-- Default values - converted from Jerbil syntax -->
<#assign
	image = image!"https://good-loop.com/img/gl-logo/AdsForGood/AdsForGood.png"
	author = author!"The Good-Loop Team"
	type = type!"website"
>

<!--
	Provide the header info for Facebook etc
	See:
	https://moz.com/blog/meta-data-templates-123
	https://dev.twitter.com/docs/cards/validation/validator
	https://developers.facebook.com/tools/debug/
 	https://developers.pinterest.com/tools/url-debugger/
 	https://developers.google.com/+/web/snippet/
-->

<meta name="twitter:creator" content="@goodloophq"/>
<meta name="twitter:site" content="Good-Loop"/>
<meta property="og:site_name" content="Good-Loop" />
<meta name="twitter:image" content="${image}"/>
<meta property="og:image" content="${image}" />
<meta name="twitter:card" content="${type}"/>
<meta property="og:type" content="${type}" />
<meta property="article:author" content="${author}" />

<#if title??>
	<meta name="twitter:title" content="${title}"/>
	<meta property="og:title" content="${title}" />
</#if>
<#if description??>
	<meta name="twitter:description" content="${description}"/>
	<meta property="og:description" content="${description}" />
</#if>
<#if tag??>
	<meta property="article:tag" content="${tag}" />
</#if>
<#if date??>
	<meta property="article:published_time" content="${date}" />
</#if>
