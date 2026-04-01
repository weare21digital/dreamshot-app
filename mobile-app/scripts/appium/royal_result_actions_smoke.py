#!/usr/bin/env python3
"""Deterministic Appium smoke for DreamShot generation/result actions.

Validates:
- generation-progress back button is present (`generation-back`)
- result actions are present (`save-result`, `share-result`, `try-another-style`)
- photo flow upsell CTA is present (`generate-video-pro`)

Artifacts are written to /tmp/royal-result-smoke by default.
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
ART = Path(os.getenv("ROYAL_RESULT_SMOKE_ARTIFACT_DIR", "/tmp/royal-result-smoke"))


def tap_if_present(driver: webdriver.Remote, accessibility_id: str) -> bool:
    try:
        driver.find_element("accessibility id", accessibility_id).click()
        return True
    except NoSuchElementException:
        return False


def clear_dev_overlays(driver: webdriver.Remote) -> None:
    for _ in range(3):
        tapped = False
        for aid in (
            "Continue",
            "Go home",
            "Reload",
            "Connected to:, http://localhost:8081",
            "Connected to:, http://localhost:8084",
        ):
            tapped = tap_if_present(driver, aid) or tapped
        if not tapped:
            return
        time.sleep(0.8)


def connect_dev_server_if_needed(driver: webdriver.Remote) -> None:
    clear_dev_overlays(driver)
    for candidate in (
        "Connected to:, http://localhost:8084",
        "Connected to:, http://localhost:8081",
        "localhost:8084",
        "127.0.0.1:8084",
        "localhost:8081",
        "127.0.0.1:8081",
        "http://localhost:8084",
        "http://localhost:8081",
    ):
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
            time.sleep(0.7)
    raise TimeoutError(f"Timed out waiting for {aid}")


def find_any_style_card(driver: webdriver.Remote):
    try:
        return driver.find_element("accessibility id", "style-card-the-queen")
    except NoSuchElementException:
        pass

    try:
        return driver.find_element(
            "xpath",
            "//XCUIElementTypeButton[starts-with(@name,'style-card-') or starts-with(@label,'style-card-')]",
        )
    except NoSuchElementException:
        return None


def ensure_home(driver: webdriver.Remote) -> None:
    for _ in range(6):
        if find_any_style_card(driver) is not None:
            return
        if tap_if_present(driver, "try-another-style"):
            time.sleep(1.0)
            continue
        if tap_if_present(driver, "style-detail-back"):
            time.sleep(1.0)
            continue
        if tap_if_present(driver, "generation-back"):
            time.sleep(1.0)
            continue
        if tap_if_present(driver, "BackButton"):
            time.sleep(1.0)
            continue
        if tap_if_present(driver, "Styles, tab, 1 of 4"):
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

    end = time.time() + 40.0
    while time.time() < end:
        if find_any_style_card(driver) is not None:
            return
        connect_dev_server_if_needed(driver)
        time.sleep(0.8)

    raise TimeoutError("Timed out waiting for home style cards")


def save(driver: webdriver.Remote, name: str) -> None:
    ART.mkdir(parents=True, exist_ok=True)
    driver.save_screenshot(str(ART / name))


def open_result_preview(driver: webdriver.Remote) -> None:
    end = time.time() + 24.0
    while time.time() < end:
        tap_if_present(driver, "view-result")
        time.sleep(0.7)
        try:
            driver.find_element("accessibility id", "result-screen")
            return
        except NoSuchElementException:
            continue
    raise TimeoutError("Timed out opening result-screen from view-result")


def assert_present(driver: webdriver.Remote, aid: str) -> None:
    driver.find_element("accessibility id", aid)


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
        save(driver, "01-home.png")

        style_card = find_any_style_card(driver)
        if style_card is None:
            raise TimeoutError("No style-card-* element found on home")
        style_card.click()

        wait_for(driver, "create-photo-button")
        if tap_if_present(driver, "qa-open-photo-picker"):
            pass
        else:
            driver.find_element("accessibility id", "create-photo-button").click()

        wait_for(driver, "continue-generation")
        if tap_if_present(driver, "continue-generation-dev"):
            pass
        else:
            driver.find_element("accessibility id", "continue-generation").click()

        wait_for(driver, "generation-back")
        assert_present(driver, "generation-back")
        save(driver, "02-generation-progress.png")

        wait_for(driver, "view-result", timeout=14.0)
        open_result_preview(driver)

        for aid in (
            "generate-video-pro",
            "save-result",
            "share-result",
            "try-another-style",
        ):
            assert_present(driver, aid)

        save(driver, "03-result-actions.png")
        return 0
    except Exception:
        save(driver, "99-failure.png")
        (ART / "99-failure.xml").write_text(driver.page_source)
        raise
    finally:
        driver.quit()


if __name__ == "__main__":
    raise SystemExit(main())
