package com.goodloop.myloop;

import com.winterwell.bob.wwjobs.BuildWinterwellProject;

public class BuildMyLoop extends BuildWinterwellProject {

	public BuildMyLoop() {
		super("my-loop");
		setVersion("0.2.1"); // Nov 2022
		setScpToWW(false);
		setMainClass("com.goodloop.myloop.MyLoopMain");
	}
	
}
