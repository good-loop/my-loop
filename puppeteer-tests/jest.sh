#!/bin/bash

########
### Setting values to variables if there are no arguments given when running the script
########
JestOptionsBlob=""
ENDPOINT='http://localportal.good-loop.com'


########
### Handling Test Target arguments
########
case $1 in
	test|TEST)
	printf "\nGoing to run Jest tests on testportal.good-loop.com\n"
	ENDPOINT='https://testportal.good-loop.com'
	;;
	production|PRODUCTION)
	printf "\nGoing to run Jest tests on portal.good-loop.com\n"
	ENDPOINT='https://portal.good-loop.com'
	;;
	local|LOCAL|localhost|LOCALHOST)
	printf "\nGoing to run Jest tests on localportal.good-loop.com\n"
	ENDPOINT='http://localportal.good-loop.com'
	;;
	*)
	printf "\nGoing to run Jest tests on $1\n"
	JestOptionsBlob="$JestOptionsBlob $1"
esac

########
### Satisfy NPM contingencies
#######
printf "\nGetting NPM Packages to Run Jest Tests...\n"
npm i

#########
### Run the tests
#########
RES=$(cd ~/winterwell/wwappbase.js/test-base/res/ && find -iname "*.js")
#Jest will babel any test files itself,
#but anything it sees as "outside of its runtime" (config files)
#need to be babeled by us
printf "\nBabeling config files..."
for js_file in ${RES[*]}; do
	babel ~/winterwell/wwappbase.js/test-base/res/$js_file --out-file ~/winterwell/wwappbase.js/test-base/babeled-res/$js_file
done

#########
### Check for Test Output Folders
#########
BASE_DIR="/home/$USER/winterwell/my-loop/puppeteer-tests/"
if [[ ! -d "$BASE_DIR/test-results" ]]; then
	mkdir -p $BASE_DIR/test-results
fi

printf "\nLaunching Jest... \n"
cd /home/$USER/winterwell/my-loop/puppeteer-tests/ 
npm run jest -- --config ./jest.config.json --testURL $ENDPOINT $JestOptionsBlob
