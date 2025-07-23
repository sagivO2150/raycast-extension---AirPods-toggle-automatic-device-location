import { closeMainWindow, getPreferenceValues, showHUD } from "@raycast/api";
import { execAirPodsMenu } from "./airpods-menu";
import { Prefs } from "./type";
import {
  detectConnectedAirPods,
  getDefaultOptionsForAirPodsType,
} from "./airpods-detector-debug";
import fs from "fs";
import path from "path";

// Cross-process lock file path
const LOCK_PATH = path.join("/tmp", "raycast-airpods-toggle.lock");

export default async function main() {
  // Cross-process lock: check if lock file exists
  if (fs.existsSync(LOCK_PATH)) {
    console.log("⏸️ Execution already in progress (lock file), skipping...");
    return;
  }
  // Try to create the lock file
  try {
    fs.writeFileSync(LOCK_PATH, String(process.pid));
  } catch (e) {
    console.log("⏸️ Could not create lock file, skipping...");
    return;
  }

  try {
    const prefs = getPreferenceValues<Prefs>();
    await closeMainWindow();

    console.log("🚀 Starting AirPods Auto Detection...");
    console.log("📋 Original prefs:", prefs);

    // Auto-detect connected AirPods and update configuration
    const detection = await detectConnectedAirPods(prefs);
    console.log("🔍 Detection result:", detection);

    if (!detection.isConnected || !detection.airpodsType) {
      console.log("❌ No supported AirPods detected");
      showHUD("❌ No supported AirPods detected");
      return;
    }

    // Get default options for the detected AirPods type
    const defaultOptions = getDefaultOptionsForAirPodsType(
      detection.airpodsType,
    );
    console.log("🎛️ Default options:", defaultOptions);

    // Create updated preferences with auto-detected values
    // FORCE auto-detected values to override any cached preferences (keyboard shortcut fix)
    const updatedPrefs: Prefs = {
      ...prefs,
      airpodsIndex: detection.position,
      airpodsType: detection.airpodsType,
      // CRITICAL: Always use auto-detected defaults to prevent keyboard shortcut cache issues
      optionOne: defaultOptions.optionOne,
      optionTwo: defaultOptions.optionTwo,
    };

    console.log("📋 Final prefs for AppleScript:", updatedPrefs);
    console.log(
      `🎯 Forcing ${detection.airpodsType} options: ${defaultOptions.optionOne} ↔ ${defaultOptions.optionTwo}`,
    );

    const res = await execAirPodsMenu(updatedPrefs, "noise-control");
    if (prefs.showHudNC && res) {
      showHUD(`${res} (${detection.airpodsType})`);
    }
  } finally {
    // Remove the lock file
    try {
      fs.unlinkSync(LOCK_PATH);
    } catch (e) {
      // ignore
    }
  }
}
