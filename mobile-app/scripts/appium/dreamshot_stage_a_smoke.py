#!/usr/bin/env python3
"""Stage A smoke for DreamShot primary flow.

- Handles Expo dev-client server picker by tapping localhost/127.0.0.1 entries
- Verifies Royal home style card is visible
- Navigates to style detail -> photo picker -> generation progress -> result
- Captures screenshots for each step
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
IOS_BUNDLE_ID = os.getenv("IOS_BUNDLE_ID", "com.bvg.dreamshot")
ARTIFACT_DIR = Path(os.getenv("ROYAL_STAGE_A_ARTIFACT_DIR", "../local-operations"))


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
    # Expo dev tools can block interactions; dismiss them aggressively.
    for _ in range(3):
        tapped = False
        tapped = tap_if_present(driver, "Continue") or tapped
        tapped = tap_if_present(driver, "Go home") or tapped
        tapped = tap_if_present(driver, "Reload") or tapped
        tapped = tap_if_present(driver, "Connected to:, http://localhost:8081") or tapped
        tapped = tap_by_label_if_present(driver, "Continue") or tapped
        tapped = tap_by_label_if_present(driver, "Go home") or tapped
        if not tapped:
            return
        time.sleep(0.8)


def connect_dev_server_if_needed(driver: webdriver.Remote) -> None:
    clear_dev_overlays(driver)

    # Expo dev-client picker often shows localhost choices as static text rows.
    for candidate in [
        "Connected to:, http://localhost:8084",
        "Connected to:, http://localhost:8081",
        "localhost:8084",
        "127.0.0.1:8084",
        "localhost:8083",
        "127.0.0.1:8083",
        "localhost:8081",
        "127.0.0.1:8081",
        "http://localhost:8084",
        "http://localhost:8081",
    ]:
        if tap_if_present(driver, candidate):
            time.sleep(1.2)
            clear_dev_overlays(driver)
            return


def wait_for(driver: webdriver.Remote, accessibility_id: str, timeout: float = 35.0) -> None:
    end = time.time() + timeout
    while time.time() < end:
        try:
            driver.find_element("accessibility id", accessibility_id)
            return
        except (NoSuchElementException, WebDriverException):
            connect_dev_server_if_needed(driver)
            time.sleep(0.8)
    raise TimeoutError(f"Timed out waiting for {accessibility_id}")


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
    # Smoke runs can start from non-home routes after previous scripts.
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
    raise TimeoutError("Timed out waiting for any style-card-* element")


def save(driver: webdriver.Remote, name: str) -> None:
    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
    driver.save_screenshot(str(ARTIFACT_DIR / name))


def swipe_up(driver: webdriver.Remote) -> None:
    try:
        driver.execute_script("mobile: swipe", {"direction": "up"})
    except Exception:
        return


def open_result_preview(driver: webdriver.Remote) -> None:
    # iOS can ignore the first tap while transitions settle and CTA may be below viewport.
    end = time.time() + 24.0
    while time.time() < end:
        if tap_if_present(driver, "view-result"):
            time.sleep(0.8)

        try:
            driver.find_element("accessibility id", "result-screen")
            return
        except NoSuchElementException:
            swipe_up(driver)
            time.sleep(0.6)

    raise TimeoutError("Timed out opening result-screen from view-result")


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
        ensure_home(driver)
        save(driver, "dreamshot-stageA-home.png")

        style_card = find_any_style_card(driver)
        if style_card is None:
            raise TimeoutError("No style-card-* found on home")
        style_card.click()
        wait_for(driver, "create-photo-button")
        save(driver, "dreamshot-stageA-style-detail.png")

        if tap_if_present(driver, "qa-open-photo-picker"):
            pass
        else:
            driver.find_element("accessibility id", "create-photo-button").click()
        wait_for(driver, "continue-generation")
        save(driver, "dreamshot-stageA-photo-picker.png")

        if tap_if_present(driver, "continue-generation-dev"):
            pass
        else:
            driver.find_element("accessibility id", "continue-generation").click()
        wait_for(driver, "view-result", timeout=12.0)
        save(driver, "dreamshot-stageA-generation.png")

        open_result_preview(driver)
        save(driver, "dreamshot-stageA-result.png")
        return 0
    except Exception:
        save(driver, "dreamshot-stageA-failure.png")
        source = driver.page_source
        (ARTIFACT_DIR / "dreamshot-stageA-failure.xml").write_text(source)
        raise
    finally:
        driver.quit()


if __name__ == "__main__":
    raise SystemExit(main())
