package com.goodloop.myloop;

import java.io.File;
import java.io.IOException;
import java.io.StringWriter;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.TimeZone;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.TimeUnit;

import com.goodloop.data.Advertiser;
import com.goodloop.data.Agency;
import com.goodloop.data.Campaign;
import com.goodloop.data.NGO;
import com.google.common.cache.CacheBuilder;
import com.winterwell.data.AThing;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.Containers;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.time.Time;
import com.winterwell.utils.web.WebUtils;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.app.CrudClient;
import com.winterwell.web.app.IServlet;
import com.winterwell.web.app.ManifestServlet;
import com.winterwell.web.app.WebRequest;

import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateExceptionHandler;

/**
 * Make a meta data page for SEO
 * 
 * @author daniel
 *
 */
public class MetaHtmlServlet implements IServlet {
	/**
	 * NB: a file based cache would be faster (because: nginx)
	 * -- but this is faster to handle data edits
	 */
	static ConcurrentMap<String, String> html4slug = (ConcurrentMap) CacheBuilder.newBuilder()
			.expireAfterWrite(2, TimeUnit.MINUTES).concurrencyLevel(2).initialCapacity(10).build().asMap();


	/** HACK Hardcoded page titles */
	private static final Map<String, String> pageTitles;
	static {
		Map<String, String> ptMap = new HashMap<String, String>();
		ptMap.put("home", "Raise money for charities simply by browsing the web");
		ptMap.put("impactoverview", "Impact Hub");
		ptMap.put("ihub", "Impact Hub");
		ptMap.put("tabsforgood", "Sign Up for Tabs for Good");
		ptMap.put("ourimpact", "Our Impact");
		ptMap.put("getinvolved", "Get Involved");
		ptMap.put("green", "Green Media powered by Good-Loop");
		ptMap.put("greendash", "Good-Loop: Green-Data Dashboard");
		ptMap.put("ourstory", "My.Good-Loop: Our Story");
		pageTitles = Collections.unmodifiableMap(ptMap);
	}
	/** ...and hardcoded page images */
	private static final Map<String, String> pageImages;
	static {
		Map<String, String> imgMap = new HashMap<String, String>();
		imgMap.put("ourstory", "/img/homepage/amyanddaniel.png");
		pageImages = Collections.unmodifiableMap(imgMap);
	}

	/**
	 * FreeMarker config - because this uses the package version, upgrading the Maven package can introduce breaking changes.
	 * You can change this to e.g. Configuration.VERSION_2_3_32 if you upgrade the package, but need to lock config compatibility.
	 * Probably file a ticket if you do this. 
	 */
	private static final Configuration freeMarkerConfig = new Configuration(Configuration.getVersion());	
	static {
		/** Boilerplate setup, see https://freemarker.apache.org/docs/pgui_quickstart_createconfiguration.html */	
		try {
			freeMarkerConfig.setDirectoryForTemplateLoading(new File("templates/"));
		} catch (IOException e) {
			throw new RuntimeException("Couldn't open templates directory?", e);
		}
		freeMarkerConfig.setDefaultEncoding("UTF-8");
		freeMarkerConfig.setTemplateExceptionHandler(TemplateExceptionHandler.RETHROW_HANDLER);
		freeMarkerConfig.setLogTemplateExceptions(false);
		freeMarkerConfig.setWrapUncheckedExceptions(true);
		freeMarkerConfig.setFallbackOnNullLoopVariable(false);
		freeMarkerConfig.setSQLDateAndTimeTimeZone(TimeZone.getDefault());
	}

	private String vertiserId;

	private String agencyId;

	private String cachebuster;

	private String campaignId;

	/**
	 * Get a CrudClient to fetch items from local, test, or production portal
	 * - according to the current server, and any ?server=x override param.
	 * @param _class
	 * @param state
	 * @return
	 */
	private <T extends AThing> CrudClient<T> getPortalClient(Class<T> _class, WebRequest state) {
		String type = _class.getSimpleName().toLowerCase();
		type = type.replaceFirst("^advert", "vert"); // vertiser/vert servlets

		String newPrefix = state.get("server");
		String reqUrl = state.getRequestUrl();
		String protocol = "https";
		String prefix = "";
		// Current server type?
		try {
			URL urlParsed = new URL(reqUrl);
			protocol = urlParsed.getProtocol();
			String host = urlParsed.getHost();
			if (host.startsWith("local")) {
				prefix = "local";
			} else if (host.startsWith("test")) {
				prefix = "test";
			}
		} catch (MalformedURLException e) {}

		// Override?
		if (!Utils.isBlank(newPrefix)) {
			// "prod/production" evaluates to no prefix
			prefix = (newPrefix.matches("prod(uction)?")) ? "" : newPrefix;
		}

		// Construct endpoint URL and build client
		String endpoint = protocol + "://" + prefix + "portal.good-loop.com/" + _class.getSimpleName().toLowerCase();
		return new CrudClient<T>(_class, endpoint);
	}

	
	private Map<String, String> getPageSettings(WebRequest state, Map<String, String> vars) {
		String bit0 = state.getSlugBits(0);
		if ("campaign".equals(bit0) || "ihub".equals(bit0)) {
			return getPageSettings2_impact(state, vars);
		}
		if ("charity".equals(bit0)) {
			return getPageSettings2_charity(state, vars);
		}
		if ("greendash".equals(bit0)) {
			return getPageSettings2_greendash(state, vars);
		}

		// TODO Better Title
		String subtitle = state.getRequestPath().replace("/", "");
		// defend against an injection attack
		subtitle = WebUtils.stripTags(subtitle); // WebUtils.defuseTagByEncoding(subtitle);
		if (pageTitles.get(subtitle) != null) {
			subtitle = pageTitles.get(subtitle);
		} else {
			subtitle = subtitle.length() > 0 ? subtitle.substring(0, 1).toUpperCase() + subtitle.substring(1) : "";
		}
		vars.put("title", "My.Good-Loop " + subtitle);
		// Page-specific image in metadata?
		String image = pageImages.get(bit0);
		if (image == null) image = "";
		vars.put("image", image);

		String loadingIMG = "img/splash-screen/background-loading.svg";
		vars.put("contents", "<div style=\"height:100vh;background-color:#71ACBB;\"><img src=\""
				+ loadingIMG + "\" alt=\"loading\"/></div>");

		// custom meta/SEO info?
		// BlogPost??		
		return vars;
	}

	
	/**
	 * Sets:
	 * title: "Good-Loop: Green-Data Dashboard" (+": $agencyName" if applicable)
	 * description: "Good-Loop Green-Data Dashboard - Measure and reduce the carbon footprint from advertising"
	 * image: Advertiser's background-image or logo, or agency's BG or logo
	 * type: "summary"
	 * @param state
	 * @param vars
	 * @return
	 */
	private Map<String, String> getPageSettings2_greendash(WebRequest state, Map<String, String> vars) {
//		Campaign campaign = null;
		Advertiser vertiser = null;
		Agency agency = null;
//		if (campaignId != null) {
//			campaign = (Campaign) getPortalClient(Campaign.class, state).getIfPresent(campaignId);
//		}
		if (agencyId!=null) {
			agency = (Agency) getPortalClient(Agency.class, state).getIfPresent(agencyId);
		}
		if (vertiserId!=null) {
			vertiser = (Advertiser) getPortalClient(Advertiser.class, state).getIfPresent(vertiserId);
		}

		String title = "Good-Loop: Green-Data Dashboard";
		// Append agency name to page title, if available
		if (agency != null) {
			title += ": " + agency.getName();
		}
		vars.put("title", WebUtils2.htmlEncode(title));

		String description = "Good-Loop Green-Data Dashboard - Measure and reduce the carbon footprint from advertising";
		vars.put("description", WebUtils2.htmlEncode(description));

		// image
		String img = "";
		if (vertiser!= null && vertiser.getBranding()!=null) {
			img = Utils.or(vertiser.getBranding().backgroundImage, vertiser.getBranding().logo);
		} else if (agency != null && agency.getBranding()!=null) {
			img = Utils.or(agency.getBranding().backgroundImage, agency.getBranding().logo);
		}
		vars.put("image", img);
		
		return vars;
	}

	

	private String cachebuster() {
		if (cachebuster!=null) return cachebuster;
		try {
			Map<String, Object> m = ManifestServlet.getVersionProps();
			Time vert = (Time) m.get("lastCommit.time");
			cachebuster = WebUtils.urlEncode(Utils.or(vert.toISOString(), "none"));
			return cachebuster;
		} catch(Throwable ex) { // paranoia
			Log.e("MetaHtmlServlet", ex);
			cachebuster = "none";
			return cachebuster;
		}
	}


	/**
	 * Sets:
	 * title: "Good-Loop for $charityName" or fallback to "/charity/$charityID"
	 * image: $charity.getPhoto() or fallback to Good-Loop logo
	 * contents: ""
	 * type: "summary"
	 * @param state
	 * @param vars
	 * @return vars (same object as input)
	 */
	private Map<String, String> getPageSettings2_charity(WebRequest state, Map<String, String> vars) {
		vars.put("title", state.getRequestPath());
		vars.put("image", "https://my.good-loop.com/img/logo/Good-Loop-lockup-vertical.svg");
		vars.put("contents", "");
		// do we have a charity?
		String cid = state.getSlugBits(1);
		if (cid != null) {
			CrudClient<NGO> cc = new CrudClient<NGO>(NGO.class, "https://app.sogive.org/charity");
			try { // Handle invalid charity
				NGO ngo = cc.get(cid).java();
				vars.put("title", "Good-Loop for " + ngo.getDisplayName());
				if (ngo.getPhoto() != null)
					vars.put("image", ngo.getPhoto());
			} catch (Exception e) {
				Log.d("My-Loop", "Error loading charity " + e);
			}
		}
		return vars;
	}


	/**
	 * Sets:
	 * title: "Good-Loop Impact: $brand"
	 * image: Campaign background-image URL
	 * description: "See the impact $brand has had with Good-Loop ethical advertising!"
	 * type: "summary"
	 * @param state
	 * @param vars
	 * @return
	 */
	private Map<String, String> getPageSettings2_impact(WebRequest state, Map<String, String> vars) {
		// do we have a campaign?
		String cid = state.getSlugBits(1);
		Campaign campaign = null;
		Advertiser vertiser = null;
		Agency agency = null;
		String companyName = null;

		// Try and find campaign by vertiser
		if (cid == null && vertiserId != null) {
			CrudClient<Advertiser> cc = getPortalClient(Advertiser.class, state);
			vertiser = cc.get(vertiserId).java();
			if (vertiser != null) {
				cid = vertiser.campaign;
				companyName = vertiser.name;
			}
		}
		// Try and find campaign by agency
		if (cid == null && agencyId != null) {
			CrudClient<Agency> cc = getPortalClient(Agency.class, state);
			agency = cc.get(agencyId).java();
			if (agency != null) {
				cid = agency.campaign;
				companyName = agency.name;
			}
		}

		if (cid != null) {
			CrudClient<Campaign> cc = getPortalClient(Campaign.class, state);
			campaign = cc.get(cid).java();
			// If we haven't got a company name yet, try and use the campaign's vertiser
			// object.
			if (companyName == null) {
				CrudClient<Advertiser> cc2 = getPortalClient(Advertiser.class, state);
				try {
					vertiser = cc2.get(campaign.vertiser).java();
					if (vertiser != null) {
						companyName = vertiser.name;
					}
				} catch (Exception e) {
					// do nothing
				}
			}
		}

		String description = null;
		String title = null;
		if (companyName != null) {
			description = "See the impact " + companyName + " has had with Good-Loop ethical advertising!";
			title = "Good-Loop Impact: " + companyName;
		} else {
			description = "See the amazing impact made with Good-Loop ethical advertising!";
			title = "Good-Loop Impact: Ads for Good";
		}

		if (title != null) vars.put("title", WebUtils2.htmlEncode(title));
		if (campaign != null) vars.put("image", campaign.bg);
		if (description != null) vars.put("description", WebUtils2.htmlEncode(description));
		return vars;
	}


	@Override
	public void process(WebRequest state) throws Exception {
		// Construct a cache key for the visited page and agency/advertiser/campaign context
		String slug = state.getSlug();
		if (slug == null) slug = "null"; // so we can cache it anyway

		// For impact hub, we want different caches per vertiser/agency
		vertiserId = Utils.or(state.get("gl.vertiser"), state.get("brand"));
		agencyId = Utils.or(state.get("gl.agency"), state.get("agency"));
		campaignId = state.get("campaign");
		String serverType = state.get("server");
		if (vertiserId != null) slug += "_vertiser:" + vertiserId;
		if (agencyId != null) slug += "_agency:" + agencyId;
		if (serverType != null) slug += "_server:" + serverType;
		


		String html = html4slug.get(slug);
		if (html == null || state.debug) {
			// TODO fill in the SEO and social stuff from file or API
			Map<String,String> vars = new HashMap<String, String>();
			// Always have a value for ${contents}, ${title} and ${type}
			vars.put("contents", "");
			vars.put("title", "Good-Loop");

			// Page-specific overrides for title etc
			try {
				getPageSettings(state, vars);
			} catch (Throwable e) {
				// swallow it, more or less. Probably a 404
				Log.w("MetaHtml", e+" from "+state);
			}
			// cachebuster
			vars.put("cachebuster", cachebuster());
			// sanitise inputs against attack
			Map<String, String> safeVars = Containers.applyToValues(s -> WebUtils2.stripScripts(s), vars);
			
			// Generate page
			Template basePage = freeMarkerConfig.getTemplate("template.ftlh");
			StringWriter sw = new StringWriter();
			basePage.process(safeVars, sw);

			// cache it
			html = sw.toString();
			html4slug.put(slug, html);
		}
		// send it back
		WebUtils2.sendHtml(html, state.getResponse());
	}

}
