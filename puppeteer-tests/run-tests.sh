# !/bin/bash

########
### Preamble: Check for msmtp and mutt
########
if [[ $(which mutt) = '' ]]; then
        printf "\nYou must have mutt installed in order to run these tests\n\Install with:\n\t'sudo apt-get install mutt'\n"
        printf "\nAfter installing, you must run mutt for the first time by typing in: 'mutt'\n"
        exit 0
fi
if [[ $(which msmtp) = '' ]]; then
        printf "\nYou must have msmtp installed in order to run these tests\nInstall with:\n\t'sudo apt-get install msmtp'\n"
        exit 0
fi


########
### Whom shall receive the emails?:: Add new recipients with a comma separating the addresses
########
EMAIL_RECIPIENTS='sysadmin@good-loop.com,andris@good-loop.com'
DELAY_SECONDS='10'

########
### Ensuring that local repo of 'logins' is up-to-date
########
printf "\nEnsuring that your 'logins' are up-to-date\n"
git --git-dir=/home/$USER/winterwell/logins/.git/ --work-tree=/home/$USER/winterwell/logins gc --prune=now
git --git-dir=/home/$USER/winterwell/logins/.git/ --work-tree=/home/$USER/winterwell/logins pull origin master
git --git-dir=/home/$USER/winterwell/logins/.git/ --work-tree=/home/$USER/winterwell/logins reset --hard FETCH_HEAD


########
### Ensure that symlinks exist for .msmtprc and .muttrc
########
if [[ -f /home/$USER/.msmtprc ]]; then
        rm /home/$USER/.msmtprc
        cp /home/$USER/winterwell/logins/.msmtprc /home/$USER/.msmtprc
else
        cp /home/$USER/winterwell/logins/.msmtprc /home/$USER/.msmtprc
fi
if [[ ! -f /tmp/msmtp/msmtp.log ]]; then
        mkdir -p /tmp/msmtp/
        touch /tmp/msmtp/msmtp.log
        chmod 777 /tmp/msmtp/msmtp.log
fi
if [[ -f /home/$USER/.muttrc ]]; then
        rm /home/$USER/.muttrc
        ln -s /home/$USER/winterwell/logins/.muttrc /home/$USER/.muttrc
else
        ln -s /home/$USER/winterwell/logins/.muttrc /home/$USER/.muttrc
fi

chmod 0600 /home/$USER/.msmtprc


#########
### Launching the Tests
#########
printf "\nGetting Ready to Perform Tests...\n"
while [ $DELAY_SECONDS -gt 0 ]; do
	printf "$DELAY_SECONDS\033[0K\r"
	sleep 1
	: $((DELAY_SECONDS--))
done

bash jest.sh $1


function send_alert {
        TIME=$(date +%Y-%m-%dT%H:%M:%S-%Z)
	message="Jest Detected Failure for -- $1 --myloop tests"
	body="Hi,\nThe My-Loop jest/puppeteer script threw out a FAIL notice at $TIME:\n\n$line\n"
	title="[$HOSTNAME] $message"
	printf "$body" | mutt -s "$title" ${ATTACHMENTS[@]} -- $EMAIL_RECIPIENTS
}

ATTACHMENTS=()

NEW_FAIL_LOGS=$(find ~/winterwell/wwappbase.js/test-base/test-results/Logs/ -type f -iname "*.txt" -amin +0 -amin -4)

if [[ $NEW_FAIL_LOGS = '' ]]; then
        printf "\nNo Failures Detected\n"
else
        printf "\nFailures Detected:\n"
        for log_file in ${NEW_FAIL_LOGS[@]}; do
                ATTACHMENTS+=("-a $log_file")
                printf "\n$log_file"
        done
        printf "\n\nSending out Email with New Log Files Attached...\n"
        send_alert
        printf "\nDone\n"
fi
