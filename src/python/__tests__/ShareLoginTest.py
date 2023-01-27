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

    def test_login(self):
        'Login in green dashboard and see impressions'

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
        print(driver.get_cookies())
        driver.find_element(By.ID, 'share-btn').click()
        time.sleep(1)
        driver.find_element(By.ID, 'copy-share-dashboard-link').click()
        time.sleep(5)


if __name__ == '__main__':
    email = 'wing@good-loop.com'
    password = input(f'Please input password for {email}:' )
    # password = ''
    unittest.main()
