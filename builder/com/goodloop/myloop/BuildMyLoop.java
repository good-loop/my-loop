package com.goodloop.myloop;

import java.io.File;

import com.winterwell.bob.wwjobs.BuildWinterwellProject;

public class BuildMyLoop extends BuildWinterwellProject {

	public BuildMyLoop() {
		super("my-loop");
		setVersion("0.1.1"); // Jan 2022
		setMainClass("com.goodloop.myloop.MyLoopMain");
	}
	
}
