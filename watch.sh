# webpack --display-error-details --watch
npm i
if [[ $1 = 'prod' ]]; then
	echo "Compiling and watching with production optimisation"
	npm run compile-watch
else
	echo "Compiling and watching - dev/debug only"
	npm run compile-watch-fast
fi
