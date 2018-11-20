# Packages MyLoop into a zip file that can then be uploaded to
# https://build.phonegap.com/apps/3373427/builds

# Safety: delete any previously generated zip files
# if you don't do this, new zip created will contain the old zip file
# Means that file size grows every time that this script is run
rm myloop.zip
npm run compile
mkdir ~/winterwell/myloopapp
# PhoneGap requires that app files be wrapped in top-level directory named "www"
cp -r ~/winterwell/my-loop/web ~/winterwell/myloopapp/www
zip -r myloop.zip ~/winterwell/myloopapp/www
rm -r -f ~/winterwell/myloopapp
