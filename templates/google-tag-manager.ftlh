<#--
	Notes on alternate IDs - ported from Jerbil syntax
	Moved to FreeMarker comments so they aren't squirted out in our public HTML.
	TODO Tried to expand some of the character soup here ("MyGL+T4G" ffs) but:
	- what is "GA"? Google Ads? Google Analytics? Georgia, USA?
	- What's the difference between GA and GA4? (Appears to be Google Analytics 4?)
	- Who owns these IDs? DOES DAN OWN THESE IDS
	GA containers:
	- My Good-Loop + Tabs for Good: GTM-PGRDRB2
	- Good-Loop general: GTM-MBDXM9Q
	GA properties:
	- My Good-Loop + Tabs for Good: UA-89730678-7
	- My Good-Loop GA4: G-88QXE1Y448
	- Good-Loop general: UA-89730678-1
	copy pasta website or my-loop templates/google-analytics.html
	^ WHAT DOES THIS MEAN??? IS THIS THE SOURCE OR IS THE FILE IN website/ THE SOURCE????
-->
<#assign
	GAcontainer = GAContainer!"GTM-PGRDRB2"
>

<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
	new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
	j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
	'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
	})(window,document,'script','dataLayer','${GAcontainer}');</script>
<!-- End Google Tag Manager -->

<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${GAcontainer}" 
	height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
<#-- website/templates/google-analytics.html also calls in Google global site tag here - is this an oversight? -->