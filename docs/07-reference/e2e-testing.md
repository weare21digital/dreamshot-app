# E2E Testing with Appium

This guide covers end-to-end (E2E) testing for React Native mobile apps using Appium 3.x and the XCUITest driver for iOS.

## Overview

Appium enables automated UI testing on real devices and simulators. Unlike unit tests, E2E tests verify complete user workflows by interacting with the actual app UI.

**When to use E2E tests:**
- Critical user flows (onboarding, checkout, login)
- Regression testing before releases
- Smoke tests to verify app launches and basic navigation

**When NOT to use E2E tests:**
- Fine-grained logic testing (use unit tests)
- Rapid iteration during development (too slow)
- Validating internal state (use integration tests)

## Prerequisites

- **macOS** (for iOS testing)
- **Xcode** with Command Line Tools
- **iOS Simulator** configured
- **Node.js** 18+ (for Appium server)
- **Python** 3.8+ (for test scripts)
- **App built and installed** on simulator or device

## Installation

### 1. Install Appium Server

```bash
# Install Appium 3.x globally via npm
npm install -g appium

# Verify installation
appium --version  # Should show 3.x
```

### 2. Install XCUITest Driver

Appium uses driver plugins for platform-specific automation. For iOS, install the XCUITest driver:

```bash
# Install XCUITest driver
appium driver install xcuitest

# List installed drivers
appium driver list --installed
```

Expected output:
```
✔ Listing installed drivers
- xcuitest@10.21.2 [installed (npm)]
```

### 3. Install Python Appium Client

```bash
# Install Python client library
pip3 install Appium-Python-Client

# Verify installation
pip3 show Appium-Python-Client  # Should show 5.x
```

### 4. Verify Simulator Setup

```bash
# List available iOS simulators
xcrun simctl list devices

# Find your target simulator UUID (e.g., iPhone 16 Pro)
# Example output:
#   iPhone 16 Pro (2C77A126-5AFA-42DE-9153-4D19ED8689F2) (Booted)
```

## Starting the Appium Server

Before running tests, start the Appium server:

```bash
appium --port 4723 --relaxed-security
```

**Flags explained:**
- `--port 4723`: Default Appium port (can be changed)
- `--relaxed-security`: Allows unsafe capabilities for local testing (disable in production)

**Expected output:**
```
[Appium] Welcome to Appium v3.2.0
[Appium] Appium REST http interface listener started on http://0.0.0.0:4723
```

Leave this terminal running while tests execute.

## Python Test Script Pattern

### Basic Setup

```python
#!/usr/bin/env python3
from appium import webdriver
from appium.options.ios import XCUITestOptions
from appium.webdriver.common.appiumby import AppiumBy

def setup_driver():
    """Initialize Appium driver for iOS simulator"""
    options = XCUITestOptions()
    options.platform_name = 'iOS'
    options.device_name = 'iPhone 16 Pro'  # Must match simulator name
    options.udid = '2C77A126-5AFA-42DE-9153-4D19ED8689F2'  # Your simulator UUID
    options.bundle_id = 'com.yourapp.bundle'  # App bundle identifier
    options.no_reset = False  # Fresh install (True to keep app state)
    options.auto_accept_alerts = True  # Auto-dismiss system alerts
    options.new_command_timeout = 120  # Timeout for idle sessions
    
    driver = webdriver.Remote('http://localhost:4723', options=options)
    driver.implicitly_wait(5)  # Wait up to 5s for elements
    return driver

def main():
    driver = setup_driver()
    
    try:
        # Your test code here
        pass
    finally:
        driver.quit()

if __name__ == '__main__':
    main()
```

### Finding Elements

Appium supports multiple element location strategies:

```python
from appium.webdriver.common.appiumby import AppiumBy

# 1. By Accessibility ID (RECOMMENDED - most reliable)
button = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "submit-btn")

# 2. By Class Name (iOS UI element type)
inputs = driver.find_elements(AppiumBy.CLASS_NAME, "XCUIElementTypeTextField")

# 3. By XPath (slower, brittle - avoid if possible)
element = driver.find_element(AppiumBy.XPATH, "//XCUIElementTypeButton[@name='Submit']")

# 4. By Predicate String (iOS native)
element = driver.find_element(AppiumBy.IOS_PREDICATE, "label == 'Submit' AND visible == 1")

# 5. By Chain (iOS native, hierarchical)
element = driver.find_element(AppiumBy.IOS_CLASS_CHAIN, "**/XCUIElementTypeButton[`label == 'Submit'`]")
```

**Best practice:** Use **accessibility IDs** by setting `accessibilityLabel` or `testID` props in React Native:

```tsx
// In your React Native component
<Button testID="submit-btn" title="Submit" onPress={handleSubmit} />
```

Then target it reliably in tests:

```python
submit_btn = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "submit-btn")
```

## Common Actions

### Tap / Click

```python
# Find element and tap
button = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "login-btn")
button.click()

# Double-tap
from appium.webdriver.common.actions import ActionChains
actions = ActionChains(driver)
actions.double_click(button).perform()
```

### Type Text

```python
# Find input field
email_input = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "email-input")

# Clear existing text
email_input.clear()

# Type new text
email_input.send_keys("user@example.com")
```

### Scroll / Swipe

```python
# Swipe up (to scroll down)
driver.execute_script('mobile: scroll', {'direction': 'down'})

# Swipe with coordinates (x start, y start, x end, y end)
from selenium.webdriver.common.actions import ActionChains
from selenium.webdriver.common.actions.pointer_input import PointerInput
from selenium.webdriver.common.actions.action_builder import ActionBuilder

# Vertical swipe (scroll down)
actions = ActionBuilder(driver)
pointer = PointerInput('touch', 'finger')
actions.add_pointer_input(pointer)
actions.pointer_action.move_to_location(300, 800)
actions.pointer_action.pointer_down()
actions.pointer_action.move_to_location(300, 200)
actions.pointer_action.pointer_up()
actions.perform()
```

### Get Element Properties

```python
element = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "username-label")

# Get text content
text = element.text

# Get attribute
label = element.get_attribute('label')
value = element.get_attribute('value')
is_visible = element.get_attribute('visible')  # "true" or "false" string

# Check if element is displayed
is_displayed = element.is_displayed()

# Check if element is enabled
is_enabled = element.is_enabled()
```

### Take Screenshots

```python
import time

# Save screenshot to file
driver.save_screenshot('/tmp/test-screenshot.png')

# Or with timestamp
timestamp = int(time.time())
driver.save_screenshot(f'/tmp/test-{timestamp}.png')
```

### Wait Strategies

```python
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Wait for element to be present
wait = WebDriverWait(driver, 10)
element = wait.until(
    EC.presence_of_element_located((AppiumBy.ACCESSIBILITY_ID, "submit-btn"))
)

# Wait for element to be clickable
element = wait.until(
    EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, "submit-btn"))
)

# Implicit wait (applies to all find operations)
driver.implicitly_wait(10)  # Wait up to 10 seconds
```

## Example: Onboarding Flow Test

This example tests a complete onboarding flow with budget setup:

```python
#!/usr/bin/env python3
"""
E2E Test: Onboarding Flow with Budget Setup
Tests that users can complete onboarding and budget persists
"""

import time
from appium import webdriver
from appium.options.ios import XCUITestOptions
from appium.webdriver.common.appiumby import AppiumBy

def setup_driver():
    """Initialize Appium driver with fresh app install"""
    options = XCUITestOptions()
    options.platform_name = 'iOS'
    options.device_name = 'iPhone 16 Pro'
    options.udid = '2C77A126-5AFA-42DE-9153-4D19ED8689F2'
    options.bundle_id = 'com.budgetapp.mobile'
    options.no_reset = False  # Fresh install to test onboarding
    options.auto_accept_alerts = True
    
    driver = webdriver.Remote('http://localhost:4723', options=options)
    driver.implicitly_wait(5)
    return driver

def test_onboarding_flow(driver):
    """Test complete onboarding with budget persistence"""
    print("🧪 Starting onboarding flow test...")
    
    # Wait for app to load
    time.sleep(3)
    driver.save_screenshot('/tmp/onboarding-01-start.png')
    
    # Step 1: Find budget input field
    budget_input = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "budget-amount-input")
    print("✅ Found budget input field")
    
    # Step 2: Enter budget amount
    budget_input.clear()
    budget_input.send_keys("5000")
    print("✅ Entered budget: 5000")
    driver.save_screenshot('/tmp/onboarding-02-budget-entered.png')
    
    # Step 3: Tap Continue button
    continue_btn = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "onboarding-continue-btn")
    continue_btn.click()
    print("✅ Tapped Continue button")
    time.sleep(2)
    
    # Step 4: Complete any additional onboarding steps
    # (category selection, permissions, etc. - adjust as needed)
    driver.save_screenshot('/tmp/onboarding-03-complete.png')
    
    # Step 5: Verify budget appears on home screen
    time.sleep(2)
    budget_display = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "home-budget-display")
    budget_text = budget_display.text
    print(f"✅ Budget displayed on home: {budget_text}")
    
    # Assertion: Check budget value
    assert "5000" in budget_text or "5,000" in budget_text, \
        f"Budget not displayed correctly. Expected 5000, got: {budget_text}"
    
    print("✅ PASS: Onboarding flow completed successfully")
    driver.save_screenshot('/tmp/onboarding-04-home-screen.png')
    
    return True

def test_budget_persistence(driver):
    """Verify budget persists after app restart"""
    print("\n🧪 Testing budget persistence...")
    
    # Terminate app
    driver.terminate_app('com.budgetapp.mobile')
    print("⏹️  App terminated")
    time.sleep(2)
    
    # Relaunch app
    driver.activate_app('com.budgetapp.mobile')
    print("▶️  App relaunched")
    time.sleep(3)
    
    # Verify budget still displays
    budget_display = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "home-budget-display")
    budget_text = budget_display.text
    
    assert "5000" in budget_text or "5,000" in budget_text, \
        f"Budget did not persist. Expected 5000, got: {budget_text}"
    
    print(f"✅ PASS: Budget persisted correctly: {budget_text}")
    driver.save_screenshot('/tmp/persistence-01-verified.png')
    
    return True

def main():
    """Run all onboarding tests"""
    driver = None
    
    try:
        driver = setup_driver()
        print("✅ Appium driver initialized\n")
        
        # Run tests
        test_onboarding_flow(driver)
        test_budget_persistence(driver)
        
        print("\n✅ ALL TESTS PASSED")
        return 0
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        if driver:
            driver.save_screenshot('/tmp/test-failure.png')
        return 1
        
    finally:
        if driver:
            driver.quit()
            print("\n🛑 Driver closed")

if __name__ == '__main__':
    import sys
    sys.exit(main())
```

### Running the Test

```bash
# Make script executable
chmod +x test_onboarding.py

# Ensure Appium server is running in another terminal
# appium --port 4723 --relaxed-security

# Run the test
python3 test_onboarding.py
```

Expected output:
```
✅ Appium driver initialized

🧪 Starting onboarding flow test...
✅ Found budget input field
✅ Entered budget: 5000
✅ Tapped Continue button
✅ Budget displayed on home: $5,000.00
✅ PASS: Onboarding flow completed successfully

🧪 Testing budget persistence...
⏹️  App terminated
▶️  App relaunched
✅ PASS: Budget persisted correctly: $5,000.00

✅ ALL TESTS PASSED

🛑 Driver closed
```

## Best Practices

### 1. Use Accessibility IDs for Testability

Always add `testID` or `accessibilityLabel` to interactive elements:

```tsx
// ✅ Good
<Button testID="login-submit" title="Login" onPress={handleLogin} />
<TextInput testID="email-input" placeholder="Email" />

// ❌ Bad (hard to target reliably)
<Button title="Login" onPress={handleLogin} />
```

### 2. Wait for Elements Instead of Hard Sleeps

```python
# ❌ Bad (brittle, wastes time)
time.sleep(5)
button = driver.find_element(...)

# ✅ Good (waits only as long as needed)
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

button = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((AppiumBy.ACCESSIBILITY_ID, "submit-btn"))
)
```

### 3. Take Screenshots on Failures

Always capture screenshots when tests fail for debugging:

```python
try:
    # Test code
    pass
except Exception as e:
    driver.save_screenshot('/tmp/failure.png')
    print(f"Screenshot saved: /tmp/failure.png")
    raise
```

### 4. Use Fresh App State for Critical Tests

Set `no_reset = False` when testing onboarding or initial setup flows:

```python
options.no_reset = False  # Fresh install, clean state
```

For tests that need existing data, use `no_reset = True`:

```python
options.no_reset = True  # Keep app data between runs
```

### 5. Handle System Alerts Automatically

Enable `auto_accept_alerts` to prevent system dialogs from blocking tests:

```python
options.auto_accept_alerts = True  # Auto-accept location, notifications, etc.
```

For more control, handle alerts explicitly:

```python
try:
    alert = driver.switch_to.alert
    alert.accept()  # or alert.dismiss()
except:
    pass  # No alert present
```

### 6. Keep Tests Independent

Each test should work in isolation without depending on other tests' state:

```python
# ❌ Bad (test_b depends on test_a running first)
def test_a(driver):
    create_account(driver)

def test_b(driver):
    login(driver)  # Assumes account from test_a exists

# ✅ Good (each test sets up its own preconditions)
def test_login(driver):
    setup_test_account()  # Create account in this test
    login(driver)
```

### 7. Use Page Object Pattern for Complex UIs

Encapsulate screen interactions in classes:

```python
class LoginScreen:
    def __init__(self, driver):
        self.driver = driver
    
    @property
    def email_input(self):
        return self.driver.find_element(AppiumBy.ACCESSIBILITY_ID, "email-input")
    
    @property
    def password_input(self):
        return self.driver.find_element(AppiumBy.ACCESSIBILITY_ID, "password-input")
    
    @property
    def submit_button(self):
        return self.driver.find_element(AppiumBy.ACCESSIBILITY_ID, "login-submit")
    
    def login(self, email, password):
        self.email_input.send_keys(email)
        self.password_input.send_keys(password)
        self.submit_button.click()

# Usage
login_screen = LoginScreen(driver)
login_screen.login("user@example.com", "password123")
```

## Troubleshooting

### Appium Server Won't Start

**Error:** `Port 4723 already in use`

**Solution:**
```bash
# Find and kill process using port 4723
lsof -ti:4723 | xargs kill -9

# Or use a different port
appium --port 4724 --relaxed-security
```

### Element Not Found

**Error:** `NoSuchElementException: An element could not be located`

**Causes:**
1. Element hasn't loaded yet → Add explicit wait
2. Wrong locator strategy → Check accessibility ID matches
3. Element is off-screen → Scroll to element first

**Debug steps:**
```python
# Print page source to see available elements
print(driver.page_source)

# List all elements by type
buttons = driver.find_elements(AppiumBy.CLASS_NAME, "XCUIElementTypeButton")
for btn in buttons:
    print(f"Button: {btn.get_attribute('label')}")
```

### WebDriverAgent Build Fails

**Error:** `xcodebuild failed with code 65`

**Solution:**
```bash
# Rebuild WebDriverAgent
appium driver run xcuitest build-wda

# If still failing, clear derived data
rm -rf ~/Library/Developer/Xcode/DerivedData
```

### Expo Dev Menu Blocks Tests

If using Expo, the dev menu overlay can interfere with element detection.

**Solutions:**
1. Build a release version for testing:
   ```bash
   npx expo run:ios --configuration Release
   ```
2. Dismiss dev menu in test:
   ```python
   # Look for and dismiss dev menu
   try:
       close_btn = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "dev-menu-close")
       close_btn.click()
   except:
       pass
   ```

### Simulator Not Detected

**Error:** `No device found matching udid`

**Solution:**
```bash
# List all simulators
xcrun simctl list devices

# Boot the specific simulator
xcrun simctl boot <UUID>

# Verify it's booted
xcrun simctl list devices | grep Booted
```

## CI Integration Notes

To run Appium tests in CI (GitHub Actions, GitLab CI, etc.):

1. **Use macOS runners** (required for iOS testing)
2. **Install Appium and drivers** in CI setup:
   ```yaml
   - name: Install Appium
     run: |
       npm install -g appium
       appium driver install xcuitest
   ```
3. **Boot simulator before tests:**
   ```yaml
   - name: Boot simulator
     run: |
       xcrun simctl boot "iPhone 16 Pro"
       xcrun simctl list devices | grep Booted
   ```
4. **Run tests with proper timeouts:**
   ```yaml
   - name: Run E2E tests
     run: python3 test_onboarding.py
     timeout-minutes: 15
   ```
5. **Upload screenshots on failure:**
   ```yaml
   - name: Upload test artifacts
     if: failure()
     uses: actions/upload-artifact@v3
     with:
       name: test-screenshots
       path: /tmp/*.png
   ```

## Additional Resources

- [Appium Documentation](https://appium.io/docs/)
- [XCUITest Driver](https://github.com/appium/appium-xcuitest-driver)
- [Appium Python Client Docs](https://appium.github.io/python-client-sphinx/)
- [React Native Testing Overview](https://reactnative.dev/docs/testing-overview)
- [iOS Accessibility Inspector](https://developer.apple.com/library/archive/documentation/Accessibility/Conceptual/AccessibilityMacOSX/OSXAXTestingApps.html)

## Reference Setup (Bob's Mac mini)

Current working configuration:
- **Appium:** 3.2.0 (installed globally via npm)
- **XCUITest Driver:** 10.21.2
- **Python Client:** Appium-Python-Client 5.2.5
- **Simulator:** iPhone 16 Pro (UUID: `2C77A126-5AFA-42DE-9153-4D19ED8689F2`)
- **macOS:** 15.6
- **Xcode:** Latest stable

This setup has been verified to work with React Native 0.76+ and Expo SDK 54+.
