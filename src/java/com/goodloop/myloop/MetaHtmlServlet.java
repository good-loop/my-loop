package com.goodloop.myloop;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.TimeUnit;

import com.goodloop.data.Advertiser;
import com.goodloop.data.Agency;
import com.goodloop.data.Campaign;
import com.goodloop.data.NGO;
import com.goodloop.jerbil.BuildJerbilPage;
import com.goodloop.jerbil.JerbilConfig;
import com.google.common.cache.CacheBuilder;
import com.winterwell.data.AThing;
import com.winterwell.utils.Dep;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.Containers;
import com.winterwell.utils.io.FileUtils;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.time.Time;
import com.winterwell.utils.web.WebUtils;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.WebEx;
import com.winterwell.web.app.CrudClient;
import com.winterwell.web.app.IServlet;
import com.winterwell.web.app.ManifestServlet;
import com.winterwell.web.app.WebRequest;

/**
 * Make a meta data page for SEO
 * 
 * @author daniel
 *
 */
public class MetaHtmlServlet implements IServlet {

	/**
	 * NB: a file based cache would be faster (because: nginx) -- but this is faster
	 * to handle data edits
	 */
	static ConcurrentMap<String, String> html4slug = (ConcurrentMap) CacheBuilder.newBuilder()
			.expireAfterWrite(2, TimeUnit.MINUTES).concurrencyLevel(2).initialCapacity(10).build().asMap();

	/** HACK "special" titles */
	private static final Map<String, String> pageTitles;

	static File template = new File("templates/template.html");

	static String templateHtml = FileUtils.read(template);

	static {
		Map<String, String> aMap = new HashMap<String, String>();
		aMap.put("home", "Raise money for charities simply by browsing the web");
		aMap.put("impactoverview", "Impact Hub");
		aMap.put("ihub", "Impact Hub");
		aMap.put("green", "Green Media");
		aMap.put("tabsforgood", "Sign Up for Tabs for Good");
		aMap.put("ourimpact", "Our Impact");
		aMap.put("getinvolved", "Get Involved");
		pageTitles = Collections.unmodifiableMap(aMap);
	}

	private String vertiserId;

	private String agencyId;

	private String cachebuster;

	/**
	 * Get a CrudClient to fetch items from local, test, or production portal
	 * - according to the current server, and any ?server=x override param.
	 * @param _class
	 * @param state
	 * @return
	 */
	private CrudClient getPortalClient(Class<? extends AThing> _class, WebRequest state) {
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
		return new CrudClient(_class, endpoint);
	}

	private Map getPageSettings(WebRequest state, Map vars) {
		String bit0 = state.getSlugBits(0);
		if ("campaign".equals(bit0) || "ihub".equals(bit0)) {
			return getPageSettings2_impact(state, vars);
		}
		if ("charity".equals(bit0)) {
			return getPageSettings2_charity(state, vars);
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
		vars.put("image", "");

		String loadingIMG = "img/splash-screen/background-loading.svg";
		vars.put("contents", "<div style='height:100vh;background-color:#71ACBB;'><img src=" + loadingIMG
				+ " alt='loading'/></div>");

		// custom meta/SEO info?
		// BlogPost??		
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
	 * 
	 * @param state
	 * @param vars
	 * @return vars (same object as input)
	 */
	private Map getPageSettings2_charity(WebRequest state, Map vars) {
		vars.put("title", state.getRequestPath());
		vars.put("image", "https://good-loop.com/img/logo/good-loop-logo-text.png");
		vars.put("contents", "");
		// do we have a campaign?
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

	private Map getPageSettings2_impact(WebRequest state, Map vars) {
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
						System.out.println("VERTISER: " + campaign.vertiser + " NAME: " + vertiser.name);
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

		if (title != null)
			vars.put("title", WebUtils2.htmlEncode(title));
		if (campaign != null)
			vars.put("image", campaign.bg);
		if (description != null)
			vars.put("description", WebUtils2.htmlEncode(description));
		vars.put("type", "summary");
		return vars;
	}

	@Override
	public void process(WebRequest state) throws Exception {
		String slug = state.getSlug();
		if (slug == null)
			slug = "null"; // so we can cache it anyway

		// For impact hub, we want different caches per vertiser/agency
		vertiserId = Utils.or(state.get("gl.vertiser"), state.get("brand"));
		agencyId = Utils.or(state.get("gl.agency"), state.get("agency"));
		if (vertiserId != null)
			slug += "_vertiser:" + vertiserId;
		if (agencyId != null)
			slug += "_agency:" + agencyId;
		String serverType = state.get("server");
		if (serverType != null)
			slug += "_server:" + serverType;

		String html = html4slug.get(slug);
		if (html == null || state.debug) {
			// not cached - so make it
			JerbilConfig jc = new JerbilConfig();
			jc.useJS = false;
			Dep.set(JerbilConfig.class, jc);

			// make the page and cache it
			File src = new File("pages", FileUtils.safeFilename(state.getSlug() + ".md"));
			String srcText = "";
			if (src.isFile()) {
				srcText = FileUtils.read(src);
			} else {
				src = null;
			}
			File out = null;
			BuildJerbilPage bjp = new BuildJerbilPage(src, "", template, out);

			// TODO fill in the SEO and social stuff from file or API
			Map<String,String> vars = new HashMap();
			// Always replace $contents and $title placeholder in HTML
			vars.put("contents", "");
			vars.put("title", "Good-Loop");

			try {
				getPageSettings(state, vars);
			} catch (Throwable e) {
				// swallow it, more or less. Probably a 404
				Log.w("MetaHtml", e+" from "+state);
			}
			// cachebuster		
			vars.put("cachebuster", cachebuster());
			// sanitise inputs against attack
			Map safeVars = Containers.applyToValues(s -> WebUtils2.stripScripts(s), vars);
			// Jerbil it!
			String pageHtml = bjp.run2_render(false, srcText, templateHtml, safeVars);
			// cache it
			html = pageHtml;
			html4slug.put(slug, html);
		}
		// send it back
		WebUtils2.sendHtml(html, state.getResponse());
	}

}
