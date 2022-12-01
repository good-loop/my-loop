package com.goodloop.myloop;

import java.io.File;
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
import com.winterwell.utils.Dep;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.ArrayMap;
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

	private Map getPageSettings(WebRequest state) {
		String bit0 = state.getSlugBits(0);
		if ("campaign".equals(bit0) || "ihub".equals(bit0)) {
			return getPageSettings2_impact(state);
		}
		if ("charity".equals(bit0)) {
			return getPageSettings2_charity(state);
		}
		Map vars = new HashMap();

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

	private Map getPageSettings2_charity(WebRequest state) {
		Map vars = new HashMap();
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
				vars.put("title", "Good-Loop");
			}
		}
		return vars;
	}

	private Map getPageSettings2_impact(WebRequest state) {
		// do we have a campaign?
		String cid = state.getSlugBits(1);
		Campaign campaign = null;
		Advertiser vertiser = null;
		Agency agency = null;
		String companyName = null;

		// Try and find campaign by vertiser
		if (cid == null && vertiserId != null) {
			CrudClient<Advertiser> cc = new CrudClient<Advertiser>(Advertiser.class,
					"https://portal.good-loop.com/vertiser");
			vertiser = cc.get(vertiserId).java();
			if (vertiser != null) {
				cid = vertiser.campaign;
				companyName = vertiser.name;
			}
		}
		// Try and find campaign by agency
		if (cid == null && agencyId != null) {
			CrudClient<Agency> cc = new CrudClient<Agency>(Agency.class, "https://portal.good-loop.com/agency");
			agency = cc.get(agencyId).java();
			if (agency != null) {
				cid = agency.campaign;
				companyName = agency.name;
			}
		}
		if (cid != null) {
			CrudClient<Campaign> cc = new CrudClient<Campaign>(Campaign.class, "https://portal.good-loop.com/campaign");
			campaign = cc.get(cid).java();
			// If we haven't got a company name yet, try and use the campaign's vertiser
			// object.
			if (companyName == null) {
				CrudClient<Advertiser> cc2 = new CrudClient<Advertiser>(Advertiser.class,
						"https://portal.good-loop.com/vertiser");
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
		description = WebUtils2.htmlEncode(description);
		title = WebUtils2.htmlEncode(title);

		Map vars = new HashMap();

		if (title != null)
			vars.put("title", title);
		if (campaign != null)
			vars.put("image", campaign.bg);
		if (description != null)
			vars.put("description", description);
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
			try {
				Map vars = getPageSettings(state);
				// cachebuster		
				vars.put("cachebuster", cachebuster());
				// Jerbil it!
				String pageHtml = bjp.run2_render(false, srcText, templateHtml, vars);

				// cache it
				html = pageHtml;
				html4slug.put(slug, html);
			} catch (WebEx.E40X e) {
				// swallow it, more or less. Probably a 404
				Log.w("MetaHtml", e+" from "+state);
				html = templateHtml;
			}
		}
		// send it back
		WebUtils2.sendHtml(html, state.getResponse());
	}

}
