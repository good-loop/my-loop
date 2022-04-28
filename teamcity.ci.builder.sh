#!/bin/bash
ssh winterwell@baker.good-loop.com bash <<EOF 
/home/winterwell/config/build-scripts/builder.sh \
BUILD_TYPE="CI" \
PROJECT_NAME="my-loop" \
NAME_OF_SERVICE="my-loop" \
GIT_REPO_URL="github.com:good-loop/my-loop" \
PROJECT_ROOT_ON_SERVER="/home/winterwell/my-loop" \
PROJECT_USES_BOB="yes" \
PROJECT_USES_NPM="yes" \
PROJECT_USES_WEBPACK="yes" \
PROJECT_USES_JERBIL="yes" \
PROJECT_USES_WWAPPBASE_SYMLINK="yes"
EOF
