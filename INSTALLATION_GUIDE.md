# 🎧 AirPods Noise Control Auto - Installation Guide

## Quick Setup for Raycast

This extension automatically detects your AirPods Pro/Max and provides seamless noise control toggling.

### 📦 What You'll Get
- ✅ Auto-detection of AirPods Pro vs AirPods Max
- ✅ Smart noise control toggle (Noise Cancellation ↔ Transparency)
- ✅ Works with multiple localizations (English, Spanish, French, German, etc.)
- ✅ No manual configuration needed

---

## 🚀 Installation Steps

### Step 1: Extract the ZIP file
Unzip `AirPods-Toggle-Extension.zip` to your desired location (e.g., Desktop)

### Step 2: Install Dependencies & Import to Raycast

**For Warp Users (Recommended):**
Copy and paste this into Warp - it will handle everything automatically:

```bash
# Navigate to the extracted folder (adjust path if needed)
cd ~/Desktop/AirPods\ tuggle\ automatic\ device\ location

# Install dependencies
npm install

# Build the extension
npm run build

# Open Raycast to import
echo "✅ Dependencies installed! Now importing to Raycast..."
open raycast://extensions/import?path=$(pwd)
```

**Manual Steps (Alternative):**
1. Open Terminal/Warp
2. Navigate to the extracted folder:
   ```bash
   cd path/to/AirPods\ tuggle\ automatic\ device\ location
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Build the extension:
   ```bash
   npm run build
   ```
5. Import to Raycast:
   - Open Raycast (⌘ + Space)
   - Type "Import Extension" or go to Raycast Settings → Extensions
   - Click the "+" button → "Import Extension"
   - Select the folder you extracted

---

## 🎯 How to Use

1. **Open Raycast** (⌘ + Space)
2. **Type**: "Sagiv's Noise Toggle" or just "noise"
3. **Press Enter** - It will automatically:
   - Detect your connected AirPods
   - Toggle between Noise Cancellation and Transparency
   - Show you what mode it switched to

### 🔧 Configuration (Optional)
- The extension works out-of-the-box with auto-detection
- If you need custom settings, open Raycast → Extensions → AirPods Noise Control Auto → Preferences

---

## 🐛 Troubleshooting

**"Extension not found" error:**
- Make sure you ran `npm install` in the correct folder
- Try the Raycast import URL: `raycast://extensions/import?path=/full/path/to/folder`

**"No AirPods detected":**
- Ensure your AirPods are connected and set as the default audio device
- Check System Settings → Sound → Output to confirm

**Permission issues:**
- Grant Raycast accessibility permissions in System Settings → Privacy & Security → Accessibility

---

## 📝 Notes
- This extension requires macOS and Raycast installed
- Works with AirPods Pro (1st & 2nd gen) and AirPods Max
- Auto-detects your macOS language for Control Center interaction

**Enjoy your seamless noise control experience! 🎧**
