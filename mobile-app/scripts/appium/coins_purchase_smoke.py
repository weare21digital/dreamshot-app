#!/usr/bin/env python3
"""Appium smoke test for Coins Purchase flow.

Usage:
  python3 scripts/appium/coins_purchase_smoke.py

Environment overrides:
  APPIUM_URL=http://127.0.0.1:4723
  IOS_UDID=2C77A126-5AFA-42DE-9153-4D19ED8689F2
  IOS_DEVICE_NAME="iPhone 16 Pro"
  IOS_BUNDLE_ID=com.mobileskeleton.app
"""

from __future__ import annotations

import os
import subprocess
import time
from pathlib import Path

from appium import webdriver
from appium.options.ios import XCUITestOptions
from selenium.common.exceptions import NoSuchElementException

APPIUM_URL = os.getenv("APPIUM_URL", "http://127.0.0.1:4723")
IOS_UDID = os.getenv("IOS_UDID", "2C77A126-5AFA-42DE-9153-4D19ED8689F2")
IOS_DEVICE_NAME = os.getenv("IOS_DEVICE_NAME", "iPhone 16 Pro")
IOS_BUNDLE_ID = os.getenv("IOS_BUNDLE_ID", "com.mobileskeleton.app")
ARTIFACT_DIR = Path(os.getenv("COINS_SMOKE_ARTIFACT_DIR", "/tmp/coins-smoke"))
ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
DEEP_LINKS = [
    "mobile-app:///(main)/coins-purchase",
    "mobile-app://coins-purchase",
    "mobile-app:///(main)",
]
EXPO_URLS = [
    "exp://127.0.0.1:8081",
    "exp://localhost:8081",
    "exp://127.0.0.1:8083",
    "exp://localhost:8083",
]


def tap_if_exists(driver: webdriver.Remote, test_id: str, timeout_sec: float = 4.0) -> bool:
    deadline = time.time() + timeout_sec
    while time.time() < deadline:
        try:
            el = driver.find_element("accessibility id", test_id)
            el.click()
            return True
        except NoSuchElementException:
            time.sleep(0.25)
    return False


def read_text_if_exists(driver: webdriver.Remote, test_id: str) -> str | None:
    try:
        return driver.find_element("accessibility id", test_id).text
    except NoSuchElementException:
        return None


def open_deeplink(url: str) -> bool:
    try:
        subprocess.run(["xcrun", "simctl", "openurl", "booted", url], check=True, capture_output=True)
        return True
    except subprocess.CalledProcessError as exc:
        print(f"Deep link failed ({url}): {exc.stderr.decode(errors='ignore').strip()}")
        return False


def try_open_expo_project() -> bool:
    print("Trying Expo dev-server URLs to recover from blank shell...")
    opened_any = False
    for expo_url in EXPO_URLS:
        if open_deeplink(expo_url):
            opened_any = True
            time.sleep(1.0)
    return opened_any


def main() -> int:
    options = XCUITestOptions()
    options.platform_name = "iOS"
    options.device_name = IOS_DEVICE_NAME
    options.udid = IOS_UDID
    options.bundle_id = IOS_BUNDLE_ID
    options.no_reset = True
    options.auto_accept_alerts = True

    driver = webdriver.Remote(APPIUM_URL, options=options)

    try:
        before_balance = read_text_if_exists(driver, "coins-balance-value")
        if before_balance is None:
            print("coins-balance-value not found on first check. Trying deep links...")
            for deep_link in DEEP_LINKS:
                if not open_deeplink(deep_link):
                    continue
                time.sleep(1.0)
                before_balance = read_text_if_exists(driver, "coins-balance-value")
                if before_balance is not None:
                    print(f"Reached Purchase Coins via deep link: {deep_link}")
                    break

        if before_balance is None:
            recovered = try_open_expo_project()
            if recovered:
                for deep_link in DEEP_LINKS:
                    open_deeplink(deep_link)
                    time.sleep(1.0)
                    before_balance = read_text_if_exists(driver, "coins-balance-value")
                    if before_balance is not None:
                        print(f"Recovered Purchase Coins after Expo URL + deep link: {deep_link}")
                        break

        if before_balance is None:
            print("coins-balance-value still not found after deep-link attempts.")
            source = driver.page_source
            print(f"Page source length: {len(source)}")
            (ARTIFACT_DIR / "coins-screen-missing.xml").write_text(source)
            driver.save_screenshot(str(ARTIFACT_DIR / "coins-screen-missing.png"))
            return 2

        print(f"Balance before: {before_balance}")
        driver.save_screenshot(str(ARTIFACT_DIR / "coins-before-buy.png"))

        buy_clicked = tap_if_exists(driver, "coins-buy-coins_100", timeout_sec=5)
        if not buy_clicked:
            print("coins-buy-coins_100 button not found.")
            driver.save_screenshot(str(ARTIFACT_DIR / "coins-buy-button-missing.png"))
            return 3

        time.sleep(1.5)
        after_balance = read_text_if_exists(driver, "coins-balance-value")
        feedback = read_text_if_exists(driver, "coins-feedback")

        print(f"Balance after: {after_balance}")
        print(f"Feedback: {feedback}")

        driver.save_screenshot(str(ARTIFACT_DIR / "coins-after-buy.png"))

        if after_balance == before_balance and not feedback:
            print("No balance or feedback change detected after buy tap.")
            return 4

        print("Coins purchase smoke flow completed.")
        return 0
    finally:
        driver.quit()


if __name__ == "__main__":
    raise SystemExit(main())
