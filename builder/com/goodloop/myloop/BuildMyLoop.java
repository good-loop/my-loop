package com.goodloop.myloop;

import com.winterwell.bob.wwjobs.BuildWinterwellProject;

public class BuildMyLoop extends BuildWinterwellProject {

	public BuildMyLoop() {
		super("my-loop");
		setVersion("0.2.0"); // April 2022
		setMainClass("com.goodloop.myloop.MyLoopMain");
	}
	
}
