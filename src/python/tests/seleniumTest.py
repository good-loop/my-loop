from selenium import webdriver
from selenium.webdriver.common.by import By
import time

def loginMy(driver, email: str, password: str):
	driver.get("https://my.good-loop.com/greendash?campaign=d2JK2qan&start=2022-09-30&end=2022-10-30")
	assert 'Good-Loop' in driver.title
	driver.find_element(
		By.XPATH, '//*[@id="loginByEmail"]/div[1]/input').send_keys(email)
	driver.find_element(
		By.XPATH, '//*[@id="loginByEmail"]/div[2]/input').send_keys(password)
	driver.find_element(
		By.XPATH, '//*[@id="loginByEmail"]/div[3]/div/button').click()
	time.sleep(1)

def jwtLink(driver):
	driver.get("https://my.good-loop.com/greendash?campaign=d2JK2qan&start=2022-09-30&end=2022-10-30&jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzZXJ2ZXIiOiJ0b29scyIsInN1YiI6IkNhbXBhaWduOmQySksycWFuX2J5X3dpbmdAZ29vZC1sb29wLmNvbUBlbWFpbEBwc2V1ZG8iLCJpc3MiOiJteS5nb29kLWxvb3AuY29tIiwiaWF0IjoxNjczNjEzMTc4LCJqdGkiOiJ1bmVndmQxODVhYjFlNzgwNCJ9.NIulIsV2CPetjPAdsei1q4XW2H2BPTpV0ZTF0A8VUaB4eefE_lk_Wgg0VJAdVOSaeM40c4Uu1_t7Nf0isVy1tGtYMz1TUfNSpXOTcd1h7a0rqmZOQWwNDO7HDHmRvASTfPivh1P-7ycYyHgm-yJjPcMuRpNKVe3BCGTlY1fcvPHkLG7is-eHnC4291w4wRG0mGdtx31yKsKXFkJQsX-FnOER5N9pxhPHJ78oVHYY6pYdQrlvHzP2bLpWM-5Rf1qdCs1RUv4hOkDB_n5KyTTtcJbeDLhsWGDbdj3mich1VpCWw-razUlIVEdC98zTSFxNcBt_gJK9j5XGSQqwLu5kbA")
	time.sleep(1)

def logoutMy(driver):
	driver.find_element(By.XPATH, '//*[@id="greendash"]/ul/li/a').click()
	driver.find_element(By.XPATH, '//*[@id="greendash"]/ul/li/div/button/a').click()
	time.sleep(1)

# tests
def testLogoutBug(email: str, password: str):
	driver = webdriver.Chrome()
	loginMy(driver, email, password)
	jwtLink(driver)
	logoutMy(driver)
	before = len(driver.get_cookies())
	driver.refresh()
	after = len(driver.get_cookies())
	try:
		assert before == after
		print('Pass: No logout issue found.')
	except:
		print('Error: Cannot logout')

def testJwtLogin():
	driver = webdriver.Chrome()
	jwtLink(driver)
	try:
		driver.find_element(By.XPATH, '//*[@id="greendash"]/div/div/div[1]/div/form/span')
		print('Pass: Logged in using url jwt')
	except:
		print('Error: Cannot log in using url jwt')

if __name__ == '__main__':
	testLogoutBug(email='', password='')
	testJwtLogin()