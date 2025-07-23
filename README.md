# AirPods Noise Control

This is a simple extension that toggles between Noise Cancellation, Transparency
or Adaptive and toggles Conversation Awareness on AirPods.
> Adaptive and Conversation Awareness will only work with supported AirPods

⚠️ **This extension has been tested on macOS Ventura `13.2`, `13.3`, Sonoma `14.1.1`, and Sequoia.**

## ✨ Auto-Detection Features

The extension now automatically detects:
- **AirPods Type**: Automatically identifies if you're using AirPods Pro or AirPods Max
- **Device Position**: Defaults to position 4 (can be manually overridden if needed)
- **Optimal Settings**: Automatically configures the best toggle options for your AirPods type
  - AirPods Pro: Noise Cancellation ↔ Adaptive
  - AirPods Max: Noise Cancellation ↔ Transparency

The extension uses the system command `system_profiler SPAudioDataType` to detect which AirPods are currently connected and automatically adjusts the configuration accordingly.

## Configuration

Most configuration is now automatic, but you can still customize certain aspects:

### Manual Overrides (Optional)

If the auto-detection doesn't work perfectly for your setup, you can manually override:

- **AirPods Type**: Override the auto-detected type
- **AirPods List Position**: Override the default position (4) if your AirPods appear elsewhere in the menu

### Localization (Required for Non-English Systems)

The script uses the localized name of the Sound menu to find it in the menu bar.
If you are using a language other than English (US), you must configure the
command with the localized names.

1. Open System Settings.
2. Locate the settings pane corresponding to Control Center.
3. Set the "Control Center Localization" configuration value to the title of that settings pane.
4. Open Control Center.
5. Locate the module corresponding to your volume slider.
6. Set the "Sound Menu Localization" configuration value to the title of that module.

## Sound Menu (Recommended)

This is **optional**, but **highly recommended**. If you do not enable
this setting, the extension will have to open Control Center and navigate the
menu every time you use it, which will be slower and more disruptive.

1. Open System Settings.
2. Navigate to Control Center > Control Center Modules > Sound.
3. Set the setting to either **"Show When Active"** or **"Always Show in Menu Bar"**.

## Supported Devices

The extension automatically detects and supports:
- AirPods Pro (all generations)
- AirPods Max

It detects any AirPods device by looking for "AirPods" in the device name and determines the type by checking if "Max" is present in the name. This works with any naming convention (e.g., "John's AirPods Pro", "My AirPods Max", etc.).
