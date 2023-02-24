import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
import time

TEST_SERVER = "local"
TEST_URL = f"https://{TEST_SERVER}my.good-loop.com/greendash?campaign=mRfJRuef&period=all"

email = str()
password = str()


class ShareLoginTest(unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Chrome()

    def test_create_sharable_link(self):
        '''
        Bug: youagain will not let you create a new sharable link. 
        500: Already registered and name/password incorrect for Campaign:xxxxxxxx_by_xxxx@good-loop.com@email (app: my.good-loop.com) 
        '''

        driver = self.driver
        driver.delete_all_cookies()
        driver.get(TEST_URL)

        self.assertIn("Good-Loop", driver.title, "Login page loaded")

        driver.find_element(By.ID, 'loginByEmail-email').send_keys(email)
        driver.find_element(By.ID, 'loginByEmail-password').send_keys(password)
        driver.find_element(By.ID, 'loginByEmail-submit').click()
        time.sleep(1)

        impressions = driver.find_element(By.ID, 'impressions-span')
        self.assertIn("Impressions", impressions.text, "Logged in and see impressions")

        # Get share links
        driver.find_element(By.ID, 'share-widget-btn').click()
        time.sleep(1)
        driver.find_element(By.ID, 'copy-share-widget-link').click()
        time.sleep(1)
        for log in driver.get_log('browser'): 
            if log['level'] == 'SEVERE' and log['message'].startswith('https://youagain.good-loop.com/youagain.json'):
                self.assertNotIn('500', log['message'], "Failed to create sharable dashboard link in youagain server")

    # def test_share_link_cookies_bug(self):
    #     driver = self.driver
    #     driver.delete_all_cookies()
    #     driver.get(TEST_URL)

    #     self.assertIn("Good-Loop", driver.title, "Login page loaded")

    #     driver.find_element(By.ID, 'loginByEmail-email').send_keys(email)
    #     driver.find_element(By.ID, 'loginByEmail-password').send_keys(password)
    #     driver.find_element(By.ID, 'loginByEmail-submit').click()
    #     time.sleep(1)

if __name__ == '__main__':
    email = 'wing@good-loop.com'
    password = input(f'Please input password for {email}:' )
    # password = ''
    unittest.main()
