#!/bin/bash
BRANCH=$([[ $(sed 's/refs\/head\/master//g' <<< $1) != "" ]] && echo "feature$1" || echo "master")
ssh winterwell@baker.good-loop.com bash <<EOF 
/home/winterwell/config/build-scripts/builder.sh \
BUILD_TYPE="CI" \
PROJECT_NAME="my-loop" \
BRANCH_NAME="$BRANCH" \
NAME_OF_SERVICE="my-loop" \
GIT_REPO_URL="github.com:good-loop/my-loop" \
PROJECT_ROOT_ON_SERVER="/home/winterwell/my-loop" \
PROJECT_USES_BOB="yes" \
PROJECT_USES_NPM="yes" \
PROJECT_USES_WEBPACK="yes" \
PROJECT_USES_JERBIL="yes" \
PROJECT_USES_WWAPPBASE_SYMLINK="yes"
EOF