# !/bin/env bash

WATCH=$1
GOTINOTIFYTOOLS=`which inotifywait`
WEB=/home/$USER/winterwell/my-loop/web/style
SRC=/home/$USER/winterwell/my-loop/src/style

# the TOPLESS files are the top level files referenced in index.html
TOPLESS[0]=main.less;
TOPLESS[1]=print.less;

# run through files
for file in "${TOPLESS[@]}"; do
		if [ -e "$SRC/$file" ]; then
			echo -e "converting $file"
			lessc "$SRC/$file" "$WEB/${file%.less}.css"
		else
			echo "less file not found: $file"				
		fi
done

# watch?
if [[ $WATCH == 'watch' ]]; then
	if [ "$GOTINOTIFYTOOLS" = "" ]; then
    	echo "In order to watch and continuously convert less files, you will first need to install inotify-tools on this system"
    	echo ""
    	echo "run sudo apt-get install inotify-tools in order to install"
    	exit 0
	else
	while true
	do
		inotifywait -r -e modify,attrib,close_write,move,create,delete $SRC && \
		for file in "${TOPLESS[@]}"; do
			if [ -e "$SRC/$file" ]; then
				echo -e "converting $file"
				lessc "$SRC/$file" "$WEB/${file%.less}.css"
			else
				echo "less file not found: $file"
			fi
		done
	done
	fi
fi
