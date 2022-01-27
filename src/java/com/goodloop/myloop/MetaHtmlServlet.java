package com.goodloop.myloop;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

import com.goodloop.data.Campaign;
import com.goodloop.data.NGO;
import com.winterwell.utils.SimpleTemplateVars;
import com.winterwell.utils.io.FileUtils;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.WebPage;
import com.winterwell.web.ajax.JThing;
import com.winterwell.web.app.CrudClient;
import com.winterwell.web.app.IServlet;
import com.winterwell.web.app.WebRequest;

/**
 * Make a meta data page for SEO
 * @author daniel
 *
 */
public class MetaHtmlServlet implements IServlet {	
	
	@Override
	public void process(WebRequest state) throws Exception {			
		
		// make a file
		String html = FileUtils.read(new File("templates/template.html"));
		
		// TODO fill in the SEO and social stuff
		Map vars = getPageSettings(state);
		
		SimpleTemplateVars stv = new SimpleTemplateVars(vars);
		html = stv.process(html);
		
//		FileUtils.write(out, html); TODO
		
		// send it back
		WebUtils2.sendHtml(html, state.getResponse());
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
		vars.put("title", state.getRequestPath());
		vars.put("ogImage", "");
		vars.put("contents", "");
		return vars;
	}

	private Map getPageSettings2_impact(WebRequest state) {
		// do we have a campaign?
		String cid = state.getSlugBits(1);
		if (cid != null) {
			CrudClient<Campaign> cc = new CrudClient<Campaign>(Campaign.class, "https://portal.good-loop.com/campaign");
			Campaign campaign = cc.get(cid).java();
		}
		Map vars = new HashMap();		
		vars.put("title", state.getRequestPath()+" Campaign: "+cid);
		vars.put("ogImage", "");
		return vars;
	}


	private Map getPageSettings2_charity(WebRequest state) {
		Map vars = new HashMap();
		vars.put("title", state.getRequestPath());
		vars.put("ogImage", "");
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
