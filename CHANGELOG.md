# AirPods Noise Control Changelog

## [Auto-Detection Feature] - 2025-07-20

- **Major Feature**: Added automatic AirPods detection using `system_profiler SPAudioDataType`
- Automatically detects AirPods Pro vs AirPods Max
- Auto-configures optimal toggle options based on device type:
  - AirPods Pro: Noise Cancellation ↔ Adaptive
  - AirPods Max: Noise Cancellation ↔ Transparency
- Defaults to position 4 for device indexing (can be manually overridden)
- Made AirPods type and position preferences optional since they're now auto-detected
- Enhanced HUD feedback to show detected device type
- Graceful fallback to manual configuration if auto-detection fails

## [Bug Fix] - 2025-04-15

- Fixed incorrect logic selecting "Adaptive" instead of "Transparency" in Noise Control toggle

## [Bug Fix] - 2024-11-14

- Fixed incorrect sound menu expand toggle index computation on macOS Sequoia
- Gracefully handle AppleScript runtime errors

## [Improvements] - 2024-03-09
- Typo fixed.
- Added current mode in the subtitle of both commands.

## [Improvements] - 2024-01-03
- Added `Off` Mode
- Main function fixed

## [New Additions] - 2023-11-28

- Added adaptive option in noise control
- Added `Toggle Conversation Awareness` command

## [Initial Version] - 2023-02-16

- Published the first version of the extension.
