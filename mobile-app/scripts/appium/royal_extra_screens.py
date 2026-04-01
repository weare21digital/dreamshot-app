#!/usr/bin/env python3
"""Capture DreamShot extra Stage A screens (gallery/settings/coins).

Uses the same Expo dev-client resilience as royal_stage_a_smoke.py so runs are
stable even when the simulator opens on a stale server picker/overlay.
"""

from __future__ import annotations

import os
import time
from pathlib import Path

from appium import webdriver
from appium.options.ios import XCUITestOptions
from selenium.common.exceptions import NoSuchElementException, WebDriverException

APPIUM_URL = os.getenv("APPIUM_URL", "http://127.0.0.1:4723")
IOS_UDID = os.getenv("IOS_UDID", "2C77A126-5AFA-42DE-9153-4D19ED8689F2")
IOS_DEVICE_NAME = os.getenv("IOS_DEVICE_NAME", "iPhone 16 Pro")
IOS_BUNDLE_ID = os.getenv("IOS_BUNDLE_ID", "com.bvg.royalportrait")
ART = Path(os.getenv("ROYAL_STAGE_A_ARTIFACT_DIR", "../local-operations"))


def tap_if_present(driver: webdriver.Remote, accessibility_id: str) -> bool:
    try:
        driver.find_element("accessibility id", accessibility_id).click()
        return True
    except NoSuchElementException:
        return False


def tap_by_label_if_present(driver: webdriver.Remote, label: str) -> bool:
    xpath = f"//XCUIElementTypeButton[@label='{label}' or @name='{label}']"
    try:
        driver.find_element("xpath", xpath).click()
        return True
    except NoSuchElementException:
        return False


def clear_dev_overlays(driver: webdriver.Remote) -> None:
    for _ in range(3):
        tapped = False
        tapped = tap_if_present(driver, "Continue") or tapped
        tapped = tap_if_present(driver, "Go home") or tapped
        tapped = tap_if_present(driver, "Reload") or tapped
        tapped = tap_if_present(driver, "Connected to:, http://localhost:8081") or tapped
        tapped = tap_if_present(driver, "Connected to:, http://localhost:8084") or tapped
        tapped = tap_by_label_if_present(driver, "Continue") or tapped
        tapped = tap_by_label_if_present(driver, "Go home") or tapped
        if not tapped:
            return
        time.sleep(0.8)


def connect_dev_server_if_needed(driver: webdriver.Remote) -> None:
    clear_dev_overlays(driver)

    for candidate in [
        "Connected to:, http://localhost:8084",
        "Connected to:, http://localhost:8081",
        "localhost:8084",
        "127.0.0.1:8084",
        "localhost:8081",
        "127.0.0.1:8081",
        "http://localhost:8084",
        "http://localhost:8081",
    ]:
        if tap_if_present(driver, candidate):
            time.sleep(1.2)
            clear_dev_overlays(driver)
            return


def wait_for(driver: webdriver.Remote, aid: str, timeout: float = 35.0):
    end = time.time() + timeout
    while time.time() < end:
        try:
            return driver.find_element("accessibility id", aid)
        except (NoSuchElementException, WebDriverException):
            connect_dev_server_if_needed(driver)
            time.sleep(0.8)
    raise TimeoutError(aid)


def ensure_home(driver: webdriver.Remote) -> None:
    # Extra capture runs often start after smoke at result/settings/gallery.
    # Drive back to home before asserting style cards.
    for _ in range(5):
        try:
            driver.find_element("accessibility id", "style-card-the-queen")
            return
        except NoSuchElementException:
            pass

        if tap_if_present(driver, "try-another-style"):
            time.sleep(1.0)
            continue

        if tap_if_present(driver, "BackButton"):
            time.sleep(1.0)
            continue

        if tap_if_present(driver, "settings-tab-home"):
            time.sleep(1.0)
            continue

        if tap_if_present(driver, "gallery-tab-home"):
            time.sleep(1.0)
            continue

        if tap_if_present(driver, "home-tab-gallery"):
            time.sleep(1.0)
            continue

        connect_dev_server_if_needed(driver)
        time.sleep(0.8)

    # Final strict wait with retry logic.
    wait_for(driver, "style-card-the-queen")


def save(driver: webdriver.Remote, name: str) -> None:
    ART.mkdir(parents=True, exist_ok=True)
    driver.save_screenshot(str(ART / name))


def main() -> int:
    opts = XCUITestOptions()
    opts.platform_name = "iOS"
    opts.device_name = IOS_DEVICE_NAME
    opts.udid = IOS_UDID
    opts.bundle_id = IOS_BUNDLE_ID
    opts.no_reset = True
    opts.auto_accept_alerts = True

    driver = webdriver.Remote(APPIUM_URL, options=opts)
    try:
        ensure_home(driver)
        save(driver, "royal-stageA-home.png")

        driver.find_element("accessibility id", "home-tab-history").click()
        wait_for(driver, "gallery-tab-profile")
        time.sleep(0.8)
        save(driver, "royal-stageA-my-gallery.png")

        driver.find_element("accessibility id", "gallery-tab-profile").click()
        wait_for(driver, "settings-tab-home")
        time.sleep(0.8)
        save(driver, "royal-stageA-settings.png")

        driver.find_element("accessibility id", "settings-tab-home").click()
        wait_for(driver, "global-header-coin-balance")
        driver.find_element("accessibility id", "global-header-coin-balance").click()
        time.sleep(0.8)
        save(driver, "royal-stageA-coins.png")
        return 0
    except Exception:
        save(driver, "royal-stageA-extra-failure.png")
        (ART / "royal-stageA-extra-failure.xml").write_text(driver.page_source)
        raise
    finally:
        driver.quit()


if __name__ == "__main__":
    raise SystemExit(main())
