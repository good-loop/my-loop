package com.goodloop.mydata;

import com.winterwell.bob.wwjobs.BuildWinterwellProject;

public class BuildMyData extends BuildWinterwellProject {

	public BuildMyData() {
		super("my-data");
		setVersion("0.1.0"); // Apr 2022
		setMainClass("com.goodloop.mydata.MyDataMain");
	}
	
}
