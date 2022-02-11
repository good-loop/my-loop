#!/usr/bin/env python3
import requests
import warnings
import argparse
import time
from loguru import logger

from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

warnings.filterwarnings("ignore", category=DeprecationWarning) 

# WIP
#
# You will need to install either the Chrome or Firefox webdrivers to use this script locally.
# Ideally you will want to test on both browsers locally, and several combos remotely using CBT.
#
# Find your Chrome version: $ /usr/bin/google-chrome --version
# Download the suitable webdriver version from here: https://chromedriver.chromium.org/downloads
# chmod +x it, and place it somewhere in your $PATH variable, e.g. ~/.local/bin
#
# For Firefox, same as above, except you'll need to download geckodriver.
# Releases can be found here: https://github.com/mozilla/geckodriver/releases
#
# Python dependencies:
# $ pip3 install requests loguru selenium 

def selenium_error(message, stack):
    logger.error('{}\n\n{}'.format(message, stack))
    return False

class MyLoopTestDriver:
    _CBT_USER = 'info@winterwell.com'
    _CBT_KEY = '' # redacted

    _DUMMY_ACCOUNT_EMAIL = 'aidan+seleniumtests@good-loop.com'
    _DUMMY_ACCOUNT_PASSWORD = 'bronzing equinox chatroom rover'

    def __init__(self, 
                 tests, 
                 endpoint='test', 
                 caps=None,
                 remote=False, 
                 browser='Firefox', 
                 headless=True, 
                 wait=0) -> None:

        # Set up config for remote vs local
        if remote:
            self._CBT_API_SESSION = self._get_api_session()
            self.use_remote_driver = True
            self.caps = caps
        else:
            self.use_remote_driver = False
            self.browser = browser
            self.headless = headless
            self.wait = wait

        # Initialise driver
        self.driver = self._get_driver()
        
        if endpoint.lower() in ['local', 'test']:
            self.endpoint = 'https://{}my.good-loop.com'.format(endpoint)
        elif endpoint.lower() in ['prod', 'production']:
            self.endpoint = 'https://my.good-loop.com'
        else:
            logger.error('Unknown endpoint: '.format(endpoint))
            exit()

        # Run the tests
        self.tests = tests
        self._run_tests()

    def __del__(self):
        # Make sure that the driver closes once this script is finished, if for whatever reason it doesn't already
        try:
            self.driver.close()
        except:
            pass

    def _get_api_session(self) -> requests.Session:
        """
        Returns a requests.session object for using the CBT API.
        """
        session = requests.session()
        session.auth = (self._CBT_USER, self._CBT_KEY)

        return session
    
    def _get_driver(self) -> webdriver:
        """
        Returns either a local or remote driver which will carry out our tests.
        """
        logger.info('Attempting to create {} WebDriver...'.format(self.browser))
        logger.info('This can take a second...')

        # If using local driver - this is the default option
        if not self.use_remote_driver:
            logger.info('Running locally...')

            if self.browser.lower() == 'chrome':
                driver = webdriver.Chrome
                opts = ChromeOptions()
            elif self.browser.lower() == 'firefox':
                driver = webdriver.Firefox
                opts = FirefoxOptions()

            if self.headless:
                logger.info('Using headless mode - this is a lot faster, but harder to debug. Use --no-headless if you want to see what\'s going on.')
                opts.headless = True

            return driver(options=opts)

        # use_remote_driver was set - use CBT for testing
        logger.info('Running remotely...')
        CBT_SUB = 'hub'

        if 'platform' in self.caps.keys():
            if self.caps['platform'].lower() == 'headless':
                CBT_SUB = 'hub-cloud'

        return webdriver.Remote(
            desired_capabilities=self.caps,
            command_executor='http://{username}:{key}@{sub}.crossbrowsertesting.com:80/wd/hub'.format(
                username=self._CBT_USER,
                key=self._CBT_KEY,
                sub=CBT_SUB
            )
        )

    def _run_tests(self):
        """
        Runs tests passed to the MyLoopTestDriver object when it's created.
        """
        for test in self.tests:
            logger.info('Running {}'.format(test))
            
            result = getattr(self, str(test))()

            if result:
                logger.success('{} - PASS!'.format(test))
            else:
                logger.error('{} - FAIL!'.format(test))

            # If not running headless mode, wait a second so we can observe before moving on
            if not self.headless:
                if self.wait > 0:
                    logger.info('Waiting {} seconds before moving on...'.format(self.wait))
                    time.sleep(self.wait)

        self.driver.quit()

    def test_page_title_is_correct(self) -> bool:
        """
        Baseline to make sure everything is working properly.
        """
        self.driver.get(self.endpoint)
        
        page_title = self.driver.title

        return page_title == 'My Good-Loop - Raise money for charities simply by browsing the web.'

    def test_can_login(self) -> bool:
        """
        Test the login flow.

        Sign in using dummy account - check for existence of uxid cookie.

        TODO: Less explicit XPath selections.
        """
        self.driver.get(self.endpoint)

        logger.info('Clicking Sign-In dialog button')
        try:
            """
            TODO: This fails - but only on headless Chrome. Why?
            """
            WebDriverWait(self.driver, 100000).until(
                EC.presence_of_element_located((By.XPATH, '/html/body/div[1]/div/nav/div/ul[2]/li[2]/a'))
            ).click()
        except Exception as e:
            return selenium_error('Unable to click Sign-In dialog button', e)
            
        logger.info('Sending input to login form')
        try:
            # Wait on the form to load
            logger.info('Waiting on form to load')
            login_form = WebDriverWait(self.driver, 2).until(
                EC.presence_of_element_located((By.ID, "loginByEmail"))
            )

            # Grab the email/password input elements
            logger.info('Finding input elements')
            email_address_input = login_form.find_element(By.XPATH, ".//input[@name='email']")
            password_input = login_form.find_element(By.XPATH, ".//input[@name='password']")

            # Send our dummy account info to the form
            logger.info('Sending input to elements')
            email_address_input.send_keys(self._DUMMY_ACCOUNT_EMAIL)
            password_input.send_keys(self._DUMMY_ACCOUNT_PASSWORD)
        except Exception as e:
            return selenium_error('Unable send input to login form', e)
            

        logger.info('Attempting to sign in')
        try:
            login_button = login_form.find_element(By.XPATH, ".//button[@type='submit']")
            login_button.click()

            # Wait a second 'til the navbar updates
            WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.XPATH, '/html/body/div[1]/div/nav/div/ul[2]/li/div/a[1]/button'))
            )

            logger.info('Checking for uxid cookie')
            cookies = self.driver.get_cookies()

            if not any('uxid' in key['name'] for key in cookies):
                logger.error('No uxid cookie?')
                return
            
            if not any('{}@email'.format(self._DUMMY_ACCOUNT_EMAIL.lower()) in key.values() for key in cookies):
                logger.error('Malformed uxid?')
                return
        except Exception as e:
            return selenium_error('Error when checking login cookies', e)

        return True


# https://support.smartbear.com/crossbrowsertesting/docs/automated-testing/frameworks/selenium/python.html
CAPS = {
    'windows10_chrome_latest': {
        'browserName': 'Chrome',
        'platform': 'Windows 10',
        'screenResolution': '1920x1080',
        'record_video': 'true',
    }
}

REMOTE_TESTS = {
    'windows10_chrome_latest': [
        'test_page_title_is_correct',
    ]
}

LOCAL_TESTS = [
    'test_page_title_is_correct',
    'test_can_login'
]

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='My-Loop Selenium Testing Script')
    parser.add_argument('--remote', default=False, action='store_true', help='If this is set, this script will run remotely using CBT. Default is local.')
    parser.add_argument('--browser', default='Firefox', type=str, help='(local) Browser to be used when testing (Firefox/Chrome)')
    parser.add_argument('--no-headless', default=True, action='store_false', help='(local) Set to disable headless mode.')
    parser.add_argument('--wait', default=0, type=int, help='(local) Time to wait between tests. If not using headless mode, this can help you see what is going on before the browser closes.')
    parser.add_argument('--endpoint', default="test", type=str, help='Server to use: local, test or production. Default: test')

    args = parser.parse_args()

    if args.remote:
        for config in REMOTE_TESTS:
            MyLoopTestDriver(
                remote=True,
                caps=CAPS[config],
                tests=REMOTE_TESTS[config],
                endpoint=args.endpoint
            )
    else:
        MyLoopTestDriver(
            browser=args.browser,
            headless=args.no_headless,
            wait=args.wait,
            tests=LOCAL_TESTS,
            endpoint=args.endpoint
        )