package com.goodloop.myloop;

import com.winterwell.web.app.AMain;
import com.winterwell.web.app.BasicSiteConfig;
import com.winterwell.web.app.JettyLauncher;
import com.winterwell.web.app.LogServlet;

/**
 * A very basic server -- my.good-loop.com is nearly a pure front-end web-app.
 * The server-side java generates static responses for SEO / social media bots.
 * @author daniel
 *
 */
public class MyLoopMain extends AMain<BasicSiteConfig> {

	public MyLoopMain() {
		super("myloop", BasicSiteConfig.class);
	}
	
	public static void main(String[] args) {
		MyLoopMain amain = new MyLoopMain();
		amain.doMain(args);
	}
	
	@Override
	protected void addJettyServlets(JettyLauncher jl) {
		super.addJettyServlets(jl);
		jl.addServlet("/log", LogServlet.class);
		jl.addServlet("/*", MetaHtmlServlet.class);
	}
}
