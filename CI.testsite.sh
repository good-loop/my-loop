#!/bin/bash

# Team-City :: Update the Test Site in a CI fashion

SYNC_LIST=()
PSYNC='parallel-rsync -h /tmp/target.list.txt --user=winterwell --recursive -x -L -x -P -x -h -x --delete-before'
PSSH='parallel-ssh -t 100000000 -h /tmp/target.list.txt --user=winterwell'
DO_NOT_SYNC_LIST='/tmp/do_not_sync_list.txt'


PROJECT='myloop'
TARGETS=('hugh.soda.sh' 'gl-es-03.good-loop.com' 'gl-es-04.good-loop.com' 'gl-es-05.good-loop.com')
PROJECT_LOCATION="."
TARGET_DIRECTORY='/home/winterwell/my.good-loop.com'
IMAGE_OPTIMISE='yes'
IMAGEDIRECTORY="$PROJECT_LOCATION/web/img"
CONVERT_LESS='yes'
MINIFY_CSS='yes'
LESS_FILES_LOCATION="$PROJECT_LOCATION/src/style"
CSS_OUTPUT_LOCATION="$PROJECT_LOCATION/web/style"
WEBPACK='yes'
TEST_JAVASCRIPT='no'
JAVASCRIPT_FILES_TO_TEST=""
COMPILE_UNITS='no'
UNITS_LOCATION=""
RESTART_SERVICE_AFTER_SYNC='no'
SERVICE_NAME=('')
PLEASE_SYNC=("config" "src" "web" "package.json" "webpack.config.js" ".babelrc")
AUTOMATED_TESTING='no'
PRESERVE=()

#####################
### Section 00: EXTREMELY ESOTERIC TEAMCITY STEP FOR 'BASE' ITEMS
#####################
printf "\nRemoving old 'base' symlink\n"
rm -rf $PROJECT_LOCATION/src/js/base
printf "\nSymlinking 'base' from where TeamCity keeps it's wwappbase.js repo\n"
ln -s /home/winterwell/TeamCity/buildAgent/work/9307b27f248c307/base $PROJECT_LOCATION/src/js/base

######################
### Section 01: ESOTERIC TO TEAMCITY:: Creating a manifest html page
######################
if [[ -f web/manifest.html ]]; then
    rm -rf web/manifest.html
fi
GITINFOLN1=$(git log -1 | awk NR==1)
GITINFOLN2=$(git log -1 | awk NR==2)
GITINFOLN3=$(git log -1 | awk NR==3)
GITINFOLN4=$(git log -1 | awk NR==5)
printf "<HTML>\n\t<BODY>\n\t\t<H1>This site was built on the following repo commit:</H1>\n\t\t<H3>$GITINFOLN1</H3>\n\t\t<H3>$GITINFOLN2</H3>\n\t\t<H3>$GITINFOLN3</H3>\n\t\t<H3>$GITINFOLN4</H3>\n\t</BODY>\n</HTML>" >> web/manifest.html



#####################
### Section 01: Create the list of target servers, and create the list of excluded items that should be preserved
#####################
function create_target_list {
	if [[ -f /tmp/target.list.txt ]]; then
		rm /tmp/target.list.txt
	fi
	printf '%s\n' ${TARGETS[@]} >> /tmp/target.list.txt

	if [[ -f /tmp/exclude.list.txt ]]; then
		rm /tmp/exclude.list.txt
	fi
	printf '%s\n' ${PRESERVE[@]} >> /tmp/exclude.list.txt
}

#####################
### Section 02: Define the Image Optimisation Function
#####################
function image_optimisation {
	# Check to see if this function is needed
	if [[ $IMAGE_OPTIMISE = 'yes' ]]; then
		# check for dependencies
		GOTOPTIPNG=$(which optipng)
		GOTJPEGOPTIM=$(which jpegoptim)
		if [[ $GOTOPTIPNG = '' ]]; then
			printf "\nThis script tried to find your installation of optipng on your system, and couldn't find it.\n"
			printf "\nInstall optipng with 'sudo apt-get --yes install optipng'\n"
			printf "\n....exiting...\n"
			exit 2
		fi
		if [[ $GOTJPEGOPTIM = '' ]]; then
			printf "\nThis script tried to find your installation of jpegoptim on your system, and couldn't find it.\n"
			printf "\nInstall jpegoptim with 'sudo apt-get --yes install jpegoptim'\n"
			printf "\n...exiting...\n"
			exit 2
		fi
		# check to see if the imagedirectory was specified
		if [[ $IMAGEDIRECTORY = '' ]]; then
			printf "\nYou must adjust this script and add the directory where your image files are kept if you want them to be optimised\n"
			printf "\n...exiting...\n"
			exit 2
		fi
		# check to see if there are existing array text files
		EXISTINGPNGARRAYTXT=$(find $IMAGEDIRECTORY/ -type f -name 'pngarray.txt')
		GOTPNGS=$(find $IMAGEDIRECTORY/ -type f -name '*.png')
		if [[ $EXISTINGPNGARRAYTXT = '' ]]; then
			if [[ $GOTPNGS = '' ]]; then
				printf "\nNo PNG files found in your specified image directory $IMAGEDIRECTORY\n"
				printf "\nAnd no pngarray text file found either, a blank file will be created for future runs of this script.\n"
				touch $IMAGEDIRECTORY/pngarray.txt
				OPTIMISEPNGSTASK='no'
			else
				printf "\nYou have PNG files, but no pngarray.txt file yet.  All PNG files will now be optimised as if this is your first run.\n"
				touch $IMAGEDIRECTORY/pngarray.txt
				OPTIMISEPNGSTASK='yes'
			fi
		elif [[ $GOTPNGS = '' ]]; then
			printf "\nNo PNG files found to optimise\n"
			OPTIMISEPNGSTASK='no'
		else
			printf "\nYou don't yet have a pngarray.txt file in your specified image directory.  This script will create one now for future runs.\n"
			printf "\nAll PNG files will now be optimised and recorded so that they won't be optimised again in the future.\n"
			touch $IMAGEDIRECTORY/pngarray.txt
			OPTIMISEPNGSTASK='yes'
		fi
		EXISTINGJPGARRAYTXT=$(find $IMAGEDIRECTORY/ -type f -name 'jpgarray.txt')
		GOTJPGS=$(find $IMAGEDIRECTORY/ -type f -name '*.jpg')
		if [[ $EXISTINGJPGARRAYTXT = '' ]]; then
			if [[ $GOTJPGS = '' ]]; then
				printf "\nNo JPG files found in your specified image directory $IMAGEDIRECTORY\n"
				printf "\nAnd no jpgarray.txt file found either, a blank file will be created for future runs of this script\n"
				touch $IMAGEDIRECTORY/jpgarray.txt
				OPTIMISEJPGSTASK='no'
			else
				printf "\nYou have JPG files, but no jpgarray.txt file yet.  All JPG files will now be optimised as if this is your first run.\n"
				touch $IMAGEDIRECTORY/jpgarray.txt
				OPTIMISEJPGSTASK='yes'
			fi
		elif [[ $GOTJPGS = '' ]]; then
			printf "\nNo JPG files found to optimise\n"
			OPTIMISEJPGSTASK='no'
		else
			printf "\nYou don't yet have a jpgarray.txt file in your specified image directory. This script will create one now for future runs.\n"
			printf "\nAll JPG files will now be optimised and recorded so that they won't be optimised again in the future.\n"
			touch $IMAGEDIRECTORY/jpgarray.txt
			OPTIMISEJPGSTASK='yes'
		fi
		EXISTINGJPEGARRAYTXT=$(find $IMAGEDIRECTORY/ -type -f -name 'jpegarray.txt')
		GOTJPEGS=$(find $IMAGEDIRECTORY/ -type f -name '*.jpeg')
		if [[ $EXISTINGJPEGARRAYTXT = '' ]]; then
			if [[ $GOTJPEGS = '' ]]; then
				printf "\nNo JPEG files found in your specifiec image directory $IMAGEDIRECTORY\n"
				printf "\nAnd no jpegarray.txt file found either, a blank file will be created for future runs of this script\n"
				touch $IMAGEDIRECTORY/jpegarray.txt
				OPTIMISEJPEGSTASK='no'
			else
				printf "\nYou have JPEG files, but not jpegarray.txt file yet.  All JPEG files will now be optimised as if this is your first run.\n"
				touch $IMAGEDIRECTORY/jpegarray.txt
				OPTIMISEJPEGSTASK='yes'
			fi
		elif [[ $GOTJPEGS = '' ]]; then
			printf "\nNo JPEG files found to optimise\n"
			OPTIMISEJPEGSTASK='no'
		else
			printf "\nYou don't yet have a jpegarray.txt file in your specified image directory. This script will create one now for future runs.\n"
			printf "\nAll JPEG files will not be optimised and recorded so that they won't be optimised again in the future.\n"
			touch $IMAGEDIRECTORY/jpegarray.txt
			OPTIMISEJPEGSTASK='yes'
		fi

		#check for newarray.txt files to be killed
		GOTNEWPNGARRAYFILE=$(find $IMAGEDIRECTORY/ -type f -name 'newpngarray.txt')
		if [[ $GOTNEWPNGARRAYFILE != '' ]]; then
			rm $IMAGEDIRECTORY/newpngarray.txt
		fi
		GOTNEWJPGARRAYFILE=$(find $IMAGEDIRECTORY/ -type f -name 'newjpgarray.txt')
		if [[ $GOTNEWJPGARRAYFILE != '' ]]; then
			rm $IMAGEDIRECTORY/newjpgarray.txt
		fi
		GOTNEWJPEGARRAYFILE=$(find $IMAGEDIRECTORY/ -type f -name 'newjpegarray.txt')
		if [[ $GOTNEWJPEGARRAYFILE != '' ]]; then
			rm $IMAGEDIRECTORY/newjpegarray.txt
		fi

		#Perform the optimisations and update the array files

		## For PNGs
		if [[ $OPTIMISEPNGSTASK = 'yes' ]]; then
			mapfile -t OPTIMISEDPNGS < $IMAGEDIRECTORY/pngarray.txt
			for file in $(find $IMAGEDIRECTORY/ -type f -name '*.png'); do
				PNGMD5OUTPUT=$(md5sum $file)
				printf '%s\n' "$PNGMD5OUTPUT" >> $IMAGEDIRECTORY/newpngarray.txt
			done
			mapfile -t PNGARRAY < $IMAGEDIRECTORY/newpngarray.txt
			UNIQUEPNGS=$(diff $IMAGEDIRECTORY/pngarray.txt $IMAGEDIRECTORY/newpngarray.txt | grep ">" | awk '{print $3}')
			if [[ ${UNIQUEPNGS[*]} = '' ]]; then
				printf "\nNo new PNG files to optimise\n"
			else
				for png in ${UNIQUEPNGS[*]}; do
					optipng $png
				done
			fi
			rm $IMAGEDIRECTORY/pngarray.txt
			touch $IMAGEDIRECTORY/pngarray.txt
			for file in $(find $IMAGEDIRECTORY/ -type f -name '*.png'); do
				PNGMD5OUTPUT=$(md5sum $file)
				printf '%s\n' "$PNGMD5OUTPUT" >> $IMAGEDIRECTORY/pngarray.txt
			done
		fi

		## For JPGs
		if [[ $OPTIMISEJPGSTASK = 'yes' ]]; then
			mapfile -t OPTIMISEDJPGS < $IMAGEDIRECTORY/jpgarray.txt
			for file in $(find $IMAGEDIRECTORY/ -type f -name '*.jpg'); do
				JPGMD5OUTPUT=$(md5sum $file)
				printf '%s\n' "$JPGMD5OUTPUT" >> $IMAGEDIRECTORY/newjpgarray.txt
			done
			mapfile -t JPGARRAY < $IMAGEDIRECTORY/newjpgarray.txt
			UNIQUEJPGS=$(diff $IMAGEDIRECTORY/jpgarray.txt $IMAGEDIRECTORY/newjpgarray.txt | grep ">" | awk '{print $3}')
			if [[ ${UNIQUEJPGS[*]} = '' ]]; then
				printf "\nNo new JPG files to optimise\n"
			else
				for jpg in ${UNIQUEJPGS[*]}; do
					jpegoptim $jpg
				done
			fi
			rm $IMAGEDIRECTORY/jpgarray.txt
			touch $IMAGEDIRECTORY/jpgarray.txt
			for file in $(find $IMAGEDIRECTORY/ -type f -name '*.jpg'); do
				JPGMD5OUTPUT=$(md5sum $file)
				printf '%s\n' "$JPGMD5OUTPUT" >> $IMAGEDIRECTORY/jpgarray.txt
			done
		fi

		## For JPEGs
		if [[ $OPTIMISEJPEGSTASK = 'yes' ]]; then
			mapfile -t OPTIMISEDJPEGS < $IMAGEDIRECTORY/jpegarray.txt
			for file in $(find $IMAGEDIRECTORY/ -type f -name '*.jpeg'); do
				JPEGMD5OUTPUT=$(md5sum $file)
				printf '%s\n' "$JPEGMD5OUTPUT" >> $IMAGEDIRECTORY/newjpegarray.txt
			done
			mapfile -t JPEGARRAY < $IMAGEDIRECTORY/newjpegarray.txt
			UNIQUEJPEGS=$(diff $IMAGEDIRECTORY/jpegarray.txt $IMAGEDIRECTORY/newjpegarray.txt | grep ">" | awk '{print $3}')
			if [[ ${UNIQUEJPEGS[*]} = '' ]]; then
				printf "No new JPEG files to optimise"
			else
				for jpeg in ${UNIQUEJPEGS[*]}; do
					jpegoptim $jpeg
				done
			fi
			rm $IMAGEDIRECTORY/jpegarray.txt
			touch $IMAGEDIRECTORY/jpegarray.txt
			for file in $(find $IMAGEDIRECTORY/ -type f -name '*.jpeg'); do
				JPEGMD5OUTPUT=$(md5sum $file)
				printf '%s\n' "$JPEGMD5OUTPUT" >> $IMAGEDIRECTORY/jpegarray.txt
			done
		fi
	fi
}

##################################
### Section 03: Define the Webpack Function
##################################
function webpack {
	if [[ $WEBPACK = yes ]]; then
		printf "\nGetting NPM Dependencies ..."
		$PSSH "cd $TARGET_DIRECTORY && npm i"
		printf "\nWebpacking ..."
    	$PSSH "cd $TARGET_DIRECTORY && webpack --progress -p"
	fi
}

##################################
### Section 04: Define the Functions that can start and stop a process on the server
##################################
function stop_proc {
	if [[ $RESTART_SERVICE_AFTER_SYNC = 'yes' ]]; then
		for service in ${SERVICE_NAME[@]}; do
			printf "\nStopping $SERVICE_NAME on $TARGETS\n"
			$PSSH "sudo service $SERVICE_NAME stop"
		done
	fi
}

function start_proc {
	if [[ $RESTART_SERVICE_AFTER_SYNC = 'yes' ]]; then
		for service in ${SERVICE_NAME[@]}; do
			printf "\nStarting $SERVICE_NAME on $TARGETS\n"
			$PSSH "sudo service $SERVICE_NAME start"
		done
	fi
}

##################################
### Section 05: Defining the 'Convert Less Files' function
##################################
function convert_less_files {
	if [[ $CONVERT_LESS = 'yes' ]]; then
		if [[ $LESS_FILES_LOCATION = "" ]]; then
			printf "\nYour specified project $PROJECT , has the parameter 'CONVERT_LESS' set to 'yes', but no input directory has been set\nExiting process\n"
			exit 0
		elif
			[[ $CSS_OUTPUT_LOCATION = "" ]]; then
			printf "\nYour specified project $PROJECT , has the parameter 'CONVERT_LESS' set to 'yes', and an input directory IS specified,\nbut no output directory has been specified\nExiting process\n"
			exit 0
		fi
		LESS_FILES=$(find $LESS_FILES_LOCATION -type f -iname "*.less")
		for file in ${LESS_FILES[@]}; do
			printf "\nconverting $file"
			lessc "$file" "${file%.less}.css"
		done
		mv $LESS_FILES_LOCATION/*.css $CSS_OUTPUT_LOCATION/
	fi
}

##########################################
### Section 06: Defining the Sync
##########################################
function sync_whole_project {
	for item in ${PLEASE_SYNC[@]}; do
		if [[ $item = 'lib' ]]; then
			move_items_to_lib
			printf "\nSyncing JAR Files ...\n"
			cd $PROJECT_LOCATION && $PSYNC lib $TARGET_DIRECTORY
		else
			printf "\nSyncing $item ...\n"
			cd $PROJECT_LOCATION && $PSYNC $item $TARGET_DIRECTORY
		fi
	done
}

###########################################
### Section 07: Defining the process used in order to preserve files/directories before a destructive sync
###########################################
function preserve_items {
	for item in ${PRESERVE[@]}; do
		printf "\nPreserving $item\n"
		$PSSH "if [[ -d /tmp/$item ]]; then continue; else mkdir -p /tmp/$item; fi"
		$PSSH "cd $TARGET_DIRECTORY && rsync -rRhP $item /tmp"
	done
}

function restore_preserved {
	for item in ${PRESERVE[@]}; do
		printf "\nRestoring $item\n"
		$PSSH "cd /tmp && rsync -rRhP $item $TARGET_DIRECTORY/"
	done
}

##########################################
### Seciton 08: Defining the Function for minifying CSS
##########################################
function minify_css {
	for css in $(find $CSS_OUTPUT_LOCATION -type f -iname "*.css"); do
		mv $css $css.original
		uglifycss $css.original > $css
	done
}





##########################################
### Section 09: Performing the Actual Publish
##########################################
printf "\nCreating Target List\n"
create_target_list
image_optimisation
convert_less_files
minify_css
preserve_items
printf "\nSyncing $PROJECT to $TARGETS\n"
sync_whole_project
restore_preserved
printf "\nSyncing Configs\n"
webpack
printf "\nPublishing Process has completed\n"
