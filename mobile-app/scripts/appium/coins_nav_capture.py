from pathlib import Path

from appium import webdriver
from appium.options.ios import XCUITestOptions

opts = XCUITestOptions()
opts.platform_name = "iOS"
opts.device_name = "iPhone 16 Pro"
opts.udid = "2C77A126-5AFA-42DE-9153-4D19ED8689F2"
opts.bundle_id = "com.bvg.dreamshot"
opts.no_reset = True
opts.auto_accept_alerts = True


driver = webdriver.Remote("http://127.0.0.1:4723", options=opts)
try:
    driver.implicitly_wait(6)
    coin = driver.find_element("accessibility id", "global-header-coin-balance")
    coin.click()
    out = Path("../local-operations/dreamshot-stageA-coins-nav.png").resolve()
    driver.save_screenshot(str(out))
    print(f"saved {out}")
finally:
    driver.quit()
