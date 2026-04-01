#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────────────────────
# setup.sh — Configure a freshly forked skeleton app
#
# Usage:
#   ./setup.sh                          Interactive mode
#   ./setup.sh --verify                 Verify-only (no changes)
#   ./setup.sh --non-interactive \      Scripted/AI mode
#     --name "QuickNutrition" \
#     --mode "device:freemium"
# ─────────────────────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MOBILE_DIR="$SCRIPT_DIR/mobile-app"
DESIGN_DIR="$SCRIPT_DIR/design"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

ok()   { echo -e "  ${GREEN}✅${NC} $1"; }
warn() { echo -e "  ${YELLOW}⚠️${NC}  $1"; }
fail() { echo -e "  ${RED}❌${NC} $1"; }
info() { echo -e "  ${BLUE}ℹ${NC}  $1"; }
header() { echo -e "\n${BOLD}$1${NC}"; }

# Derive slug from app name: "Quick Nutrition" → "quicknutrition"
to_slug() {
  echo "$1" | tr '[:upper:]' '[:lower:]' | tr -d ' -_'
}

# Derive bundle ID from slug: "quicknutrition" → "com.quicknutrition.app"
to_bundle_id() {
  echo "com.$1.app"
}

# ─────────────────────────────────────────────────────────────────────────────
# Color extraction from design files (layered fallback)
# ─────────────────────────────────────────────────────────────────────────────

extract_color() {
  local color_name="$1"
  local result=""

  # Layer 1: Tailwind config block — "primary": "#2bee3b"
  for html_file in "$DESIGN_DIR"/*/code.html; do
    [ -f "$html_file" ] || continue
    result=$(grep -o "\"${color_name}\"[[:space:]]*:[[:space:]]*\"#[0-9a-fA-F]\{3,8\}\"" "$html_file" 2>/dev/null | head -1 | grep -o '#[0-9a-fA-F]\{3,8\}' || true)
    [ -n "$result" ] && echo "$result" && return 0
  done

  # Layer 2: CSS custom property — --primary: #2bee3b
  for html_file in "$DESIGN_DIR"/*/code.html; do
    [ -f "$html_file" ] || continue
    result=$(grep -o "\-\-${color_name}[[:space:]]*:[[:space:]]*#[0-9a-fA-F]\{3,8\}" "$html_file" 2>/dev/null | head -1 | grep -o '#[0-9a-fA-F]\{3,8\}' || true)
    [ -n "$result" ] && echo "$result" && return 0
  done

  return 1
}

extract_all_colors() {
  local primary secondary accent bg_light bg_dark

  primary=$(extract_color "primary" 2>/dev/null || true)
  secondary=$(extract_color "secondary" 2>/dev/null || true)
  accent=$(extract_color "accent" 2>/dev/null || true)
  bg_light=$(extract_color "background-light" 2>/dev/null || true)
  bg_dark=$(extract_color "background-dark" 2>/dev/null || true)

  # Primary is required
  if [ -z "$primary" ]; then
    return 1
  fi

  echo "primary=$primary"
  echo "secondary=${secondary:-}"
  echo "accent=${accent:-}"
  echo "bg_light=${bg_light:-}"
  echo "bg_dark=${bg_dark:-}"
}

# ─────────────────────────────────────────────────────────────────────────────
# File writers
# ─────────────────────────────────────────────────────────────────────────────

update_app_json() {
  local name="$1" slug="$2" scheme="$3" bundle_id="$4"

  # Use node for reliable JSON manipulation
  node -e "
    const fs = require('fs');
    const path = '$MOBILE_DIR/app.json';
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));
    const expo = data.expo || data;

    expo.name = '$name';
    expo.slug = '$slug';
    expo.scheme = '$scheme';
    if (expo.ios) expo.ios.bundleIdentifier = '$bundle_id';
    if (expo.android) expo.android.package = '$bundle_id';

    // Update deep link schemes
    if (expo.plugins) {
      expo.plugins = expo.plugins.map(p => {
        if (Array.isArray(p) && p[0] === 'expo-build-properties') {
          return p; // Leave build properties alone
        }
        return p;
      });
    }

    fs.writeFileSync(path, JSON.stringify(data.expo ? data : { expo }, null, 2) + '\n');
  "
}

update_package_json() {
  local slug="$1"

  # Root package.json
  if [ -f "$SCRIPT_DIR/package.json" ]; then
    node -e "
      const fs = require('fs');
      const path = '$SCRIPT_DIR/package.json';
      const data = JSON.parse(fs.readFileSync(path, 'utf8'));
      data.name = '$slug';
      fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
    "
  fi

  # Mobile package.json
  if [ -f "$MOBILE_DIR/package.json" ]; then
    node -e "
      const fs = require('fs');
      const path = '$MOBILE_DIR/package.json';
      const data = JSON.parse(fs.readFileSync(path, 'utf8'));
      data.name = '$slug';
      fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
    "
  fi
}

update_theme() {
  local primary="$1" secondary="$2" accent="$3"
  local theme_file="$MOBILE_DIR/src/config/theme.ts"

  [ -f "$theme_file" ] || return 1

  # Replace brand colors using sed
  if [ -n "$primary" ]; then
    sed -i '' "s/primary: '[^']*'/primary: '${primary}'/" "$theme_file"
    sed -i '' "s/primary: \"[^\"]*\"/primary: \"${primary}\"/" "$theme_file"
  fi
  if [ -n "$secondary" ]; then
    sed -i '' "s/secondary: '[^']*'/secondary: '${secondary}'/" "$theme_file"
    sed -i '' "s/secondary: \"[^\"]*\"/secondary: \"${secondary}\"/" "$theme_file"
  fi
  if [ -n "$accent" ]; then
    sed -i '' "s/accent: '[^']*'/accent: '${accent}'/" "$theme_file"
    sed -i '' "s/accent: \"[^\"]*\"/accent: \"${accent}\"/" "$theme_file"
  fi
}

update_app_config() {
  local auth_mode="$1"
  local config_file="$MOBILE_DIR/src/config/app.ts"

  [ -f "$config_file" ] || return 1

  sed -i '' "s/authMode: '[^']*'/authMode: '${auth_mode}'/" "$config_file"
  sed -i '' "s/authMode: \"[^\"]*\"/authMode: \"${auth_mode}\"/" "$config_file"
}

update_iap_config() {
  local payment_mode="$1" access_mode="$2" bundle_id="$3"
  local iap_file="$MOBILE_DIR/src/config/iap.ts"

  [ -f "$iap_file" ] || return 1

  sed -i '' "s/paymentMode: '[^']*'/paymentMode: '${payment_mode}'/" "$iap_file"
  sed -i '' "s/paymentMode: \"[^\"]*\"/paymentMode: \"${payment_mode}\"/" "$iap_file"
  sed -i '' "s/accessMode: '[^']*'/accessMode: '${access_mode}'/" "$iap_file"
  sed -i '' "s/accessMode: \"[^\"]*\"/accessMode: \"${access_mode}\"/" "$iap_file"

  # Update product IDs to use new bundle ID prefix
  sed -i '' "s/\['app_lifetime'\]/['${bundle_id}.lifetime']/" "$iap_file"
  sed -i '' "s/\['app_pro_monthly', 'app_pro_yearly'\]/['${bundle_id}.monthly', '${bundle_id}.yearly']/" "$iap_file"
}

# ─────────────────────────────────────────────────────────────────────────────
# Verify mode
# ─────────────────────────────────────────────────────────────────────────────

do_verify() {
  header "Verifying setup..."
  local errors=0 warnings=0

  # app.json
  header "App Identity (app.json)"
  if [ -f "$MOBILE_DIR/app.json" ]; then
    local app_name app_slug app_scheme bundle_id android_pkg

    app_name=$(node -e "const d=JSON.parse(require('fs').readFileSync('$MOBILE_DIR/app.json','utf8'));const e=d.expo||d;process.stdout.write(e.name||'')")
    app_slug=$(node -e "const d=JSON.parse(require('fs').readFileSync('$MOBILE_DIR/app.json','utf8'));const e=d.expo||d;process.stdout.write(e.slug||'')")
    app_scheme=$(node -e "const d=JSON.parse(require('fs').readFileSync('$MOBILE_DIR/app.json','utf8'));const e=d.expo||d;process.stdout.write(e.scheme||'')")
    bundle_id=$(node -e "const d=JSON.parse(require('fs').readFileSync('$MOBILE_DIR/app.json','utf8'));const e=d.expo||d;process.stdout.write((e.ios&&e.ios.bundleIdentifier)||'')")
    android_pkg=$(node -e "const d=JSON.parse(require('fs').readFileSync('$MOBILE_DIR/app.json','utf8'));const e=d.expo||d;process.stdout.write((e.android&&e.android.package)||'')")

    [ -n "$app_name" ] && ok "name: ${app_name}" || { fail "name is empty"; ((errors++)); }
    [ -n "$app_slug" ] && ok "slug: ${app_slug}" || { fail "slug is empty"; ((errors++)); }
    [ -n "$app_scheme" ] && ok "scheme: ${app_scheme}" || { fail "scheme is empty"; ((errors++)); }
    [ -n "$bundle_id" ] && ok "iOS bundleIdentifier: ${bundle_id}" || { fail "iOS bundleIdentifier is empty"; ((errors++)); }
    [ -n "$android_pkg" ] && ok "Android package: ${android_pkg}" || { warn "Android package is empty"; ((warnings++)); }

    # Check if still skeleton defaults
    if [ "$app_name" = "mobile-app" ]; then
      warn "name is still skeleton default ('mobile-app')"
      ((warnings++))
    fi
    if [ "$bundle_id" = "com.mobileskeleton.app" ]; then
      warn "bundleIdentifier is still skeleton default ('com.mobileskeleton.app')"
      ((warnings++))
    fi

    # Check slug matches scheme
    if [ "$app_slug" != "$app_scheme" ]; then
      warn "slug ('${app_slug}') doesn't match scheme ('${app_scheme}')"
      ((warnings++))
    fi
  else
    fail "app.json not found at $MOBILE_DIR/app.json"
    ((errors++))
  fi

  # Theme
  header "Theme (src/config/theme.ts)"
  local theme_file="$MOBILE_DIR/src/config/theme.ts"
  if [ -f "$theme_file" ]; then
    local t_primary t_secondary t_accent
    t_primary=$(grep -o "primary: '[^']*'" "$theme_file" | head -1 | grep -o "'[^']*'" | tr -d "'" || true)
    t_secondary=$(grep -o "secondary: '[^']*'" "$theme_file" | head -1 | grep -o "'[^']*'" | tr -d "'" || true)
    t_accent=$(grep -o "accent: '[^']*'" "$theme_file" | head -1 | grep -o "'[^']*'" | tr -d "'" || true)

    [ -n "$t_primary" ] && ok "primary: ${t_primary}" || { fail "primary color not set"; ((errors++)); }
    [ -n "$t_secondary" ] && ok "secondary: ${t_secondary}" || { warn "secondary color not set"; ((warnings++)); }
    [ -n "$t_accent" ] && ok "accent: ${t_accent}" || { warn "accent color not set"; ((warnings++)); }

    # Check against design files
    local d_primary
    d_primary=$(extract_color "primary" 2>/dev/null || true)
    if [ -n "$d_primary" ] && [ -n "$t_primary" ]; then
      local t_lower d_lower
      t_lower=$(echo "$t_primary" | tr '[:upper:]' '[:lower:]')
      d_lower=$(echo "$d_primary" | tr '[:upper:]' '[:lower:]')
      if [ "$t_lower" = "$d_lower" ]; then
        ok "theme primary matches design files"
      else
        warn "theme primary (${t_primary}) differs from design (${d_primary})"
        ((warnings++))
      fi
    fi
  else
    fail "theme.ts not found"
    ((errors++))
  fi

  # App config
  header "App Modes"
  local app_config="$MOBILE_DIR/src/config/app.ts"
  local iap_config="$MOBILE_DIR/src/config/iap.ts"

  if [ -f "$app_config" ]; then
    local auth_mode
    auth_mode=$(grep -o "authMode: '[^']*'" "$app_config" | grep -o "'[^']*'" | tr -d "'" || true)
    [ -n "$auth_mode" ] && ok "authMode: ${auth_mode}" || { fail "authMode not set"; ((errors++)); }
  else
    fail "app.ts not found"
    ((errors++))
  fi

  if [ -f "$iap_config" ]; then
    local payment_mode access_mode
    payment_mode=$(grep -o "paymentMode: '[^']*'" "$iap_config" | grep -o "'[^']*'" | tr -d "'" || true)
    access_mode=$(grep -o "accessMode: '[^']*'" "$iap_config" | grep -o "'[^']*'" | tr -d "'" || true)
    [ -n "$payment_mode" ] && ok "paymentMode: ${payment_mode}" || { fail "paymentMode not set"; ((errors++)); }
    [ -n "$access_mode" ] && ok "accessMode: ${access_mode}" || { fail "accessMode not set"; ((errors++)); }
  else
    fail "iap.ts not found"
    ((errors++))
  fi

  # Environment
  header "Environment (.env)"
  local env_file="$MOBILE_DIR/.env"
  if [ -f "$env_file" ]; then
    ok ".env exists"
    local ios_client_id
    ios_client_id=$(grep 'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID' "$env_file" | cut -d= -f2 || true)
    if [ -n "$ios_client_id" ] && [ "$ios_client_id" != "your-ios-client-id.apps.googleusercontent.com" ]; then
      ok "Google iOS Client ID is set"
    else
      warn "Google iOS Client ID is placeholder (set before building)"
      ((warnings++))
    fi
  else
    warn ".env not found (copy from .env.example)"
    ((warnings++))
  fi

  # Assets
  header "Assets"
  for icon in icon.png adaptive-icon.png splash-icon.png favicon.png; do
    if [ -f "$MOBILE_DIR/assets/icons/$icon" ]; then
      ok "assets/icons/${icon} exists"
    else
      fail "assets/icons/${icon} missing"
      ((errors++))
    fi
  done

  if [ -f "$MOBILE_DIR/GoogleService-Info.plist" ]; then
    ok "GoogleService-Info.plist exists"
  else
    warn "GoogleService-Info.plist missing (needed for Google Sign-In)"
    ((warnings++))
  fi

  # Design files
  header "Design Files"
  local design_count
  design_count=$(find "$DESIGN_DIR" -name 'code.html' 2>/dev/null | wc -l | tr -d ' ')
  if [ "$design_count" -gt 0 ]; then
    ok "${design_count} design file(s) found"
  else
    warn "No design files in design/ (Phase 1)"
    ((warnings++))
  fi

  # Summary
  header "Summary"
  if [ "$errors" -eq 0 ] && [ "$warnings" -eq 0 ]; then
    echo -e "  ${GREEN}${BOLD}All checks passed!${NC}"
  elif [ "$errors" -eq 0 ]; then
    echo -e "  ${YELLOW}${BOLD}${warnings} warning(s), no errors${NC}"
  else
    echo -e "  ${RED}${BOLD}${errors} error(s), ${warnings} warning(s)${NC}"
  fi

  [ "$errors" -eq 0 ] && return 0 || return 1
}

# ─────────────────────────────────────────────────────────────────────────────
# Interactive mode
# ─────────────────────────────────────────────────────────────────────────────

do_interactive() {
  echo -e "${BOLD}"
  echo "┌─────────────────────────────────────┐"
  echo "│     🦴 Skeleton App Setup           │"
  echo "│     Fork → Configure → Build        │"
  echo "└─────────────────────────────────────┘"
  echo -e "${NC}"

  # ── Step 1: Extract colors from design files ──
  header "Step 1: Reading design files..."

  local primary="" secondary="" accent="" bg_light="" bg_dark=""
  local color_output

  if ! color_output=$(extract_all_colors 2>/dev/null); then
    echo ""
    fail "No brand colors found in design files."
    echo ""
    echo "  Your design HTML files need a tailwind config block with named colors."
    echo "  See: docs/01-getting-started/design-mockups.md"
    echo ""
    echo "  Example (in design/*/code.html):"
    echo ""
    echo "    colors: {"
    echo "        \"primary\": \"#FF6B6B\","
    echo "        \"secondary\": \"#4ECDC4\","
    echo "        \"accent\": \"#3B82F6\","
    echo "    }"
    echo ""
    exit 1
  fi

  eval "$color_output"
  echo ""
  ok "primary:          ${primary}"
  [ -n "$secondary" ] && ok "secondary:        ${secondary}" || warn "secondary:        not found (will keep skeleton default)"
  [ -n "$accent" ]    && ok "accent:           ${accent}"    || warn "accent:           not found (will keep skeleton default)"
  [ -n "$bg_light" ]  && info "background-light: ${bg_light}"
  [ -n "$bg_dark" ]   && info "background-dark:  ${bg_dark}"

  # ── Step 2: App name ──
  header "Step 2: App name"
  echo ""
  local app_name=""
  while [ -z "$app_name" ]; do
    read -rp "  App name (e.g. QuickNutrition): " app_name
  done

  local slug bundle_id scheme
  slug=$(to_slug "$app_name")
  bundle_id=$(to_bundle_id "$slug")
  scheme="$slug"

  echo ""
  info "slug:             ${slug}"
  info "bundleIdentifier: ${bundle_id}"
  info "scheme:           ${scheme}"

  # ── Step 3: App mode ──
  header "Step 3: App mode"
  echo ""
  echo "  1) device + freemium  (offline app, optional IAP — most common)"
  echo "  2) device + paid      (offline app, IAP required for access)"
  echo "  3) device + unlocked  (paid App Store download, no IAP)"
  echo "  4) backend + freemium (full SaaS with backend)"
  echo "  5) backend + paid     (full SaaS, IAP gate)"
  echo ""

  local mode_choice=""
  while [[ ! "$mode_choice" =~ ^[1-5]$ ]]; do
    read -rp "  Choose mode [1-5] (default: 1): " mode_choice
    mode_choice="${mode_choice:-1}"
  done

  local auth_mode="device" payment_mode="device" access_mode="freemium"
  case "$mode_choice" in
    1) auth_mode="device";  payment_mode="device";  access_mode="freemium" ;;
    2) auth_mode="device";  payment_mode="device";  access_mode="paid" ;;
    3) auth_mode="device";  payment_mode="device";  access_mode="unlocked" ;;
    4) auth_mode="backend"; payment_mode="backend"; access_mode="freemium" ;;
    5) auth_mode="backend"; payment_mode="backend"; access_mode="paid" ;;
  esac

  info "authMode:    ${auth_mode}"
  info "paymentMode: ${payment_mode}"
  info "accessMode:  ${access_mode}"

  # ── Confirmation ──
  header "Ready to configure"
  echo ""
  echo "  App:    ${app_name} (${slug})"
  echo "  Bundle: ${bundle_id}"
  echo "  Colors: primary=${primary} secondary=${secondary:-default} accent=${accent:-default}"
  echo "  Mode:   auth=${auth_mode} payment=${payment_mode} access=${access_mode}"
  echo ""

  local confirm=""
  read -rp "  Apply these settings? [Y/n] " confirm
  confirm="${confirm:-Y}"
  if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "  Aborted."
    exit 0
  fi

  # ── Apply ──
  header "Applying..."
  echo ""

  update_app_json "$app_name" "$slug" "$scheme" "$bundle_id"
  ok "app.json updated"

  update_package_json "$slug"
  ok "package.json updated"

  update_theme "$primary" "${secondary:-}" "${accent:-}"
  ok "theme.ts updated"

  update_app_config "$auth_mode"
  ok "app.ts updated"

  update_iap_config "$payment_mode" "$access_mode" "$bundle_id"
  ok "iap.ts updated"

  # Create .env from example if it doesn't exist
  if [ ! -f "$MOBILE_DIR/.env" ] && [ -f "$MOBILE_DIR/.env.example" ]; then
    cp "$MOBILE_DIR/.env.example" "$MOBILE_DIR/.env"
    ok ".env created from .env.example"
  fi

  echo ""
  header "Done! 🎉"
  echo ""
  echo "  Next steps:"
  echo "  1. Replace icons in assets/icons/"
  echo "  2. Add GoogleService-Info.plist (Firebase → iOS app → download)"
  echo "  3. Set EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID in .env"
  echo "  4. Run: cd mobile-app && npm install"
  echo "  5. Run: ./setup.sh --verify  (to check everything)"
  echo ""
}

# ─────────────────────────────────────────────────────────────────────────────
# Non-interactive mode
# ─────────────────────────────────────────────────────────────────────────────

do_non_interactive() {
  local app_name="" mode_str=""

  # Parse args
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --name) app_name="$2"; shift 2 ;;
      --mode) mode_str="$2"; shift 2 ;;
      *) shift ;;
    esac
  done

  if [ -z "$app_name" ]; then
    fail "--name is required in non-interactive mode"
    exit 1
  fi

  # Extract colors
  local primary="" secondary="" accent=""
  local color_output
  if color_output=$(extract_all_colors 2>/dev/null); then
    eval "$color_output"
  else
    fail "No brand colors found in design files. Add designs to design/ first."
    exit 1
  fi

  # Derive values
  local slug bundle_id scheme
  slug=$(to_slug "$app_name")
  bundle_id=$(to_bundle_id "$slug")
  scheme="$slug"

  # Parse mode (format: "auth:access" e.g. "device:freemium")
  local auth_mode="device" payment_mode="device" access_mode="freemium"
  if [ -n "$mode_str" ]; then
    auth_mode="${mode_str%%:*}"
    access_mode="${mode_str##*:}"
    payment_mode="$auth_mode"  # payment follows auth
  fi

  # Apply
  info "Configuring: ${app_name} (${bundle_id}) auth=${auth_mode} access=${access_mode}"

  update_app_json "$app_name" "$slug" "$scheme" "$bundle_id"
  ok "app.json"

  update_package_json "$slug"
  ok "package.json"

  update_theme "$primary" "${secondary:-}" "${accent:-}"
  ok "theme.ts"

  update_app_config "$auth_mode"
  ok "app.ts"

  update_iap_config "$payment_mode" "$access_mode" "$bundle_id"
  ok "iap.ts"

  if [ ! -f "$MOBILE_DIR/.env" ] && [ -f "$MOBILE_DIR/.env.example" ]; then
    cp "$MOBILE_DIR/.env.example" "$MOBILE_DIR/.env"
    ok ".env"
  fi

  ok "Done"
}

# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

# Check we're in the right directory
if [ ! -f "$MOBILE_DIR/app.json" ]; then
  fail "Can't find mobile-app/app.json. Run this script from the skeleton repo root."
  exit 1
fi

case "${1:-}" in
  --verify)
    do_verify
    ;;
  --non-interactive)
    shift
    do_non_interactive "$@"
    ;;
  --help|-h)
    echo "Usage:"
    echo "  ./setup.sh                                    Interactive setup"
    echo "  ./setup.sh --verify                           Verify configuration"
    echo "  ./setup.sh --non-interactive --name NAME      Scripted setup"
    echo "    [--mode AUTH:ACCESS]                         e.g. device:freemium"
    ;;
  *)
    do_interactive
    ;;
esac
