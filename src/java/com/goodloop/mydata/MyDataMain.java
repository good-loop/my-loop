package com.goodloop.mydata;

import com.winterwell.web.app.AMain;
import com.winterwell.web.app.BasicSiteConfig;
import com.winterwell.web.app.JettyLauncher;

public class MyDataMain extends AMain<BasicSiteConfig> {

	public MyDataMain() {
		super("mydata", BasicSiteConfig.class);
	}
	
	public static void main(String[] args) {
		MyDataMain amain = new MyDataMain();
		amain.doMain(args);
	}
	
	@Override
	protected void addJettyServlets(JettyLauncher jl) {
		super.addJettyServlets(jl);
		jl.addServlet("/*", MyDataMetaHtmlServlet.class);
	}
}
