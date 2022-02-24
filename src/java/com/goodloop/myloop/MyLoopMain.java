package com.goodloop.myloop;

import com.winterwell.web.app.AMain;
import com.winterwell.web.app.BasicSiteConfig;
import com.winterwell.web.app.JettyLauncher;

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
		jl.addServlet("/*", MetaHtmlServlet.class);
	}
}
