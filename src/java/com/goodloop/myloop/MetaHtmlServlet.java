package com.goodloop.myloop;

import java.io.File;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.TimeUnit;

import com.goodloop.data.Campaign;
import com.goodloop.data.NGO;
import com.goodloop.jerbil.BuildJerbilPage;
import com.goodloop.jerbil.JerbilConfig;
import com.google.common.cache.CacheBuilder;
import com.winterwell.utils.Dep;
import com.winterwell.utils.SimpleTemplateVars;
import com.winterwell.utils.containers.Cache;
import com.winterwell.utils.io.FileUtils;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.WebPage;
import com.winterwell.web.ajax.JThing;
import com.winterwell.web.app.CrudClient;
import com.winterwell.web.app.IServlet;
import com.winterwell.web.app.WebRequest;
import com.winterwell.youagain.client.BuildYouAgainJavaClient;

/**
 * Make a meta data page for SEO
 * @author daniel
 *
 */
public class MetaHtmlServlet implements IServlet {	
	
	/**
	 * NB: a file based cache would be faster (because: nginx) -- but this is faster to handle data edits 
	 */
	static ConcurrentMap<String, String> html4slug = (ConcurrentMap) CacheBuilder.newBuilder()
			.expireAfterWrite(2, TimeUnit.MINUTES)			
			.concurrencyLevel(2)
			.initialCapacity(10)
			.build().asMap();
	
	@Override
	public void process(WebRequest state) throws Exception {					
		String slug = state.getSlug();
		if (slug==null) slug="null"; // so we can cache it anyway
		String html = html4slug.get(slug);
		if (html==null || state.debug) {
			JerbilConfig jc = new JerbilConfig();
			jc.useJS = false;
			Dep.set(JerbilConfig.class, jc);
			
			// make the page and cache it
			File template = new File("templates/template.html");
			File src = new File("pages", FileUtils.safeFilename(state.getSlug()+".md"));
			String srcText = "";
			if (src.isFile()) {
				srcText = FileUtils.read(src);
			} else {
				src = null;
			}
			File out = null;			
			BuildJerbilPage bjp = new BuildJerbilPage(src, "", template, out);
			String templateHtml = FileUtils.read(template);

			// TODO fill in the SEO and social stuff from file or API
			Map vars = getPageSettings(state);
			
			// Jerbil it!
			String pageHtml = bjp.run2_render(false, srcText, templateHtml, vars);
			
			// cache it
			html = pageHtml;
			html4slug.put(slug, html);
		}
		// send it back
		WebUtils2.sendHtml(html, state.getResponse());
	}
	
	// Parse multi-words title
	private static final Map<String, String> pageTitles;
		static {
			Map<String, String> aMap = new HashMap<String, String>();
			aMap.put("home", "");
			aMap.put("impactoverview", "Impact Hub");
			aMap.put("green", "Green Media");
			aMap.put("tabsforgood", "Sign Up for Tabs-for-Good");
			pageTitles = Collections.unmodifiableMap(aMap);
		}

	private Map getPageSettings(WebRequest state) {
		String bit0 = state.getSlugBits(0);
		if ("impact".equals(bit0)) {
			return getPageSettings2_impact(state);
		}
		if ("charity".equals(bit0)) {
			return getPageSettings2_charity(state);
		}
		Map vars = new HashMap();
		
		// TODO Better Title
		String subtitle = state.getRequestPath().replace("/", "");
		if (pageTitles.get(subtitle) != null) {
			subtitle = pageTitles.get(subtitle);
		} else {
			subtitle = subtitle.length() > 0 ? subtitle.substring(0, 1).toUpperCase() + subtitle.substring(1) : "";
		}
		vars.put("title", "My Good-Loop "+subtitle);
		vars.put("ogImage", "");
		
		String loadingIMG = "img/splash-screen/background-loading.svg";
		vars.put("contents", "<div style='height:100vh;background-color:#71ACBB;'><img src="+loadingIMG+" alt='loading'/></div>");
		
		// custom meta/SEO info?
		// BlogPost??
		
		return vars;
	}

	private Map getPageSettings2_impact(WebRequest state) {
		// do we have a campaign?
		String cid = state.getSlugBits(1);
		if (cid != null) {
			CrudClient<Campaign> cc = new CrudClient<Campaign>(Campaign.class, "https://portal.good-loop.com/campaign");
//			Campaign campaign = cc.get(cid).java(); TODO
		}
		Map vars = new HashMap();		
		vars.put("title", state.getRequestPath()+" Campaign: "+cid);
		vars.put("ogImage", "");
		vars.put("contents", "");
		return vars;
	}


	private Map getPageSettings2_charity(WebRequest state) {
		Map vars = new HashMap();
		vars.put("title", state.getRequestPath());
		vars.put("ogImage", "");
		vars.put("contents", "");
		// do we have a campaign?
		String cid = state.getSlugBits(1);
		if (cid != null) {
			CrudClient<NGO> cc = new CrudClient<NGO>(NGO.class, "https://app.sogive.org/charity");
			try { // Handle invalid charity 
				NGO ngo = cc.get(cid).java();
				vars.put("title", "Good-Loop for "+ngo.getDisplayName());
				vars.put("ogImage", ngo.getPhoto());
			} catch(Exception e) {
				Log.d("My-Loop", "Error loading charity "+ e);
				vars.put("title", "Good-Loop");
			}
		}				
		return vars;
	}

}
