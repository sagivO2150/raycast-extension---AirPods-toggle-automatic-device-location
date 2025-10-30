# AirPods Toggle Bug Fix Guide

## 🎯 Problem Summary

**Issue**: The AirPods Pro toggle is switching between **Adaptive ↔ Off** instead of **Noise Cancellation ↔ Transparency**.

**Root Cause**: Apple changed the menu order for AirPods Pro noise control options in macOS. The code has outdated index mappings.

---

## 📋 Current vs Correct Menu Order

### ❌ OLD (Wrong) Mapping in Code
```applescript
-- AirPods Pro: Transparency=1, Adaptive=2, Noise Cancellation=3, Off=0
```

### ✅ NEW (Correct) Mapping from macOS
Based on your screenshot and actual menu:
```
Noise Control
  1. Off
  2. Transparency  
  3. Adaptive
  4. Noise Cancellation
```

So the mapping should be:
```applescript
-- AirPods Pro: Off=1, Transparency=2, Adaptive=3, Noise Cancellation=4
```

---

## 🔧 Required Fix

### File: `src/airpods-menu.ts`

**Find this section** (around lines 20-45):

```typescript
on getOptionIndex(Opt, deviceType)
        if deviceType is equal to "AirPods Max" then
                -- AirPods Max: Off=1, Transparency=2, Noise Cancellation=3
                if Opt is equal to "Off" then
                        return 1
                else if Opt is equal to "Transparency" then
                        return 2
                else if Opt is equal to "Noise Cancellation" then
                        return 3
                else
                        return 0
                end if
        else
                -- AirPods Pro: Transparency=1, Adaptive=2, Noise Cancellation=3, Off=0
                if Opt is equal to "Transparency" then
                        return 1
                else if Opt is equal to "Adaptive" then
                        return 2
                else if Opt is equal to "Noise Cancellation" then
                        return 3
                else if Opt is equal to "Off" then
                        return 0
                else
                        return 0
                end if
        end if
end getOptionIndex
```

**Replace the AirPods Pro section (else block) with**:

```typescript
        else
                -- AirPods Pro: Off=1, Transparency=2, Adaptive=3, Noise Cancellation=4
                if Opt is equal to "Off" then
                        return 1
                else if Opt is equal to "Transparency" then
                        return 2
                else if Opt is equal to "Adaptive" then
                        return 3
                else if Opt is equal to "Noise Cancellation" then
                        return 4
                else
                        return 0
                end if
        end if
end getOptionIndex
```

---

## ✅ Verification

After making the change:

1. **Check that the file `src/airpods-detector-debug.ts` already has the correct defaults** (it does!):
   ```typescript
   // AirPods Pro
   console.log("🎧 AirPods Pro: Using Noise Cancellation ↔ Transparency");
   return {
     optionOne: "Noise Cancellation",
     optionTwo: "Transparency",
   };
   ```

2. **Build the extension**:
   ```bash
   npm run build
   ```

3. **Reload in Raycast**:
   - Open Raycast
   - Go to Extensions
   - Find your AirPods toggle extension
   - Press `⌘R` to reload

4. **Test**:
   - Trigger the toggle
   - Should switch between **Noise Cancellation ↔ Transparency**
   - NOT Adaptive ↔ Off anymore

---

## 🗂️ Repository Info

**Correct Repository**: 
- Path: `~/Documents/my_tools/raycast extensions/AirPods tuggle automatic device location/`
- GitHub: `https://github.com/sagivO2150/raycast-extension---AirPods-toggle-automatic-device-location.git`
- Branch: Create new branch `menu-order-fix`

**Wrong Repository** (we were working here by mistake):
- Path: `~/Documents/my_tools/raycast_ext/`
- GitHub: `https://github.com/sagivO2150/my-raycast-ext.git`
- This is an older version from July 23

---

## 📝 What Was Already Done

In the WRONG repository (`my-raycast-ext`), we:
1. ✅ Created branch `bug-fix`
2. ✅ Created `quick_commit.py` script for easy commits
3. ✅ Identified the menu order bug
4. ✅ Applied the fix to `src/airpods-menu.ts`
5. ✅ Applied the fix to `src/airpods-detector-debug.ts` 
6. ✅ Applied the fix to `src/airpods-detector.ts`
7. ✅ Successfully built the extension

**BUT** - all these changes were in the wrong repo!

---

## 🚀 Next Steps

1. **Create the `quick_commit.py` script** in the correct repo (optional but helpful)

2. **Create a new git branch**:
   ```bash
   git checkout -b menu-order-fix
   ```

3. **Apply the fix** to `src/airpods-menu.ts` as described above

4. **Build and test**:
   ```bash
   npm run build
   # Then reload in Raycast and test
   ```

5. **Commit the fix**:
   ```bash
   git add src/airpods-menu.ts
   git commit -m "Fix AirPods Pro menu order mapping - Off=1, Transparency=2, Adaptive=3, NC=4"
   git push -u origin menu-order-fix
   ```

6. **Clear any cached positions** (if toggle still doesn't work):
   - The extension caches the menu position in LocalStorage
   - You might need to clear it or let it rescan on first run
   - The code has auto-retry logic that should handle this

---

## 🐛 Additional Context

### Why "No AirPods Detected" Might Happen

If you're getting "No AirPods detected" with both AirPods connected:

1. **Check detection command works**:
   ```bash
   system_profiler SPAudioDataType | grep -B 10 'Default Output Device: Yes' | grep '^[[:space:]]*[^[:space:]].*:$' | tail -1 | sed 's/:$//' | sed 's/^[[:space:]]*//'
   ```
   This should return: `Sagiv's AirPods Pro`

2. **Check AppleScript timeout**:
   - The detection has a 10-second timeout
   - If it's failing, you'll see errors in Raycast console logs

3. **Position Scanning**:
   - The extension has smart logic to avoid scanning Control Center every time
   - It caches the last successful position
   - If toggle fails, it auto-rescans and retries
   - This is in `src/index.ts` lines 87-130

### Current Code Features (Already Working)

- ✅ Auto-detects AirPods Pro vs Max
- ✅ Caches successful menu positions
- ✅ Auto-retries with position rescan if first attempt fails
- ✅ Lock mechanism to prevent concurrent executions
- ✅ Universal localization support
- ✅ 2-second pause before rescan (to let Control Center close)
- ✅ Supports multiple AirPods connected (uses default output device)

**Only thing broken**: The menu index mapping for AirPods Pro options!

---

## 📞 Files Overview

### Main Files in Correct Repo:
- `src/index.ts` - Main entry point with retry logic ✅ (working, no changes needed)
- `src/airpods-detector-debug.ts` - Auto-detection logic ✅ (working, correct defaults already)
- `src/airpods-menu.ts` - AppleScript execution ❌ (NEEDS FIX - menu indices wrong)
- `src/type.ts` - TypeScript types ✅ (working)
- `src/utils.ts` - Helper functions ✅ (working)
- `src/get_active_device_position.py` - Python helper ✅ (working)

### Only Change Needed:
**File**: `src/airpods-menu.ts`
**Section**: `getOptionIndex` function for AirPods Pro
**Change**: Update indices from old order to new order (as shown above)

---

## 🎬 Quick Command Reference

```bash
# Navigate to correct repo
cd ~/Documents/my_tools/raycast\ extensions/AirPods\ tuggle\ automatic\ device\ location

# Create branch
git checkout -b menu-order-fix

# Build
npm run build

# Commit (if you create quick_commit.py)
./quick_commit.py

# Or manual commit
git add src/airpods-menu.ts
git commit -m "Fix AirPods Pro menu order - matches current macOS"
git push -u origin menu-order-fix
```

---

## ✨ Expected Result After Fix

When you trigger the toggle:
- 🔵 **Noise Cancellation** → 🟢 **Transparency** → 🔵 **Noise Cancellation** → ...
- HUD shows: "🟢 Transparency (AirPods Pro)" or "🔵 Noise Cancellation (AirPods Pro)"
- NO MORE: Adaptive or Off appearing in the toggle

---

**Good luck! The fix is simple - just update those indices in `airpods-menu.ts`!** 🚀
