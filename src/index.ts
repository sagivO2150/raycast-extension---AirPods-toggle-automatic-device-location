import { closeMainWindow, getPreferenceValues, showHUD, LocalStorage } from "@raycast/api";
import { execAirPodsMenu } from "./airpods-menu";
import { Prefs } from "./type";
import {
  detectConnectedAirPods,
  getDefaultOptionsForAirPodsType,
  getActiveDevicePosition,
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

    // Check if we have a cached successful position from previous runs
    const cachedPosition = await LocalStorage.getItem<string>("cachedAirPodsPosition");
    console.log("💾 Cached position from previous runs:", cachedPosition);

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

    // Use cached position if available, otherwise fall back to detection result
    const effectivePosition = cachedPosition ? parseInt(cachedPosition) : detection.position;
    console.log(`🎯 Using position: ${effectivePosition} (${cachedPosition ? 'cached' : 'detected'})`);

    // Create updated preferences with auto-detected values
    // Use cached position initially to avoid double Control Center opening
    const updatedPrefs: Prefs = {
      ...prefs,
      airpodsIndex: effectivePosition, // Use cached position if available
      airpodsType: detection.airpodsType,
      // CRITICAL: Always use auto-detected defaults to prevent keyboard shortcut cache issues
      optionOne: defaultOptions.optionOne,
      optionTwo: defaultOptions.optionTwo,
    };

    console.log("📋 Final prefs for AppleScript:", updatedPrefs);
    console.log(
      `🎯 Using ${cachedPosition ? 'cached' : 'detected'} position ${effectivePosition} for ${detection.airpodsType} options: ${defaultOptions.optionOne} ↔ ${defaultOptions.optionTwo}`,
    );

    // First attempt: Try with cached/default position (ONLY opens Control Center once)
    console.log("🚀 Attempting toggle with cached position...");
    const res = await execAirPodsMenu(updatedPrefs, "noise-control");
    
    // Check if the toggle failed - execAirPodsMenu returns null on failure
    if (!res) {
      console.log("⚠️ First attempt failed - taking a breather before rescanning...");
      
      // Give it a moment to settle - Control Center needs time to close properly
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second pause
      
      console.log("🔄 Now scanning for correct position using the original working method...");
      
      // Use the original working approach: scan FIRST, then click
      const rescannedPosition = await getActiveDevicePosition(prefs);
      console.log("✅ Rescanned position found:", rescannedPosition);
      
      // Update the preferences with the newly scanned position
      const retryPrefs: Prefs = {
        ...updatedPrefs,
        airpodsIndex: rescannedPosition,
      };
      
      console.log(`🔧 Retrying with rescanned position ${rescannedPosition} using scan-first approach...`);
      
      // Give another small pause before the retry to ensure clean state
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second pause
      
      const retryRes = await execAirPodsMenu(retryPrefs, "noise-control");
      
      if (retryRes) {
        // Success on retry - UPDATE THE CACHED POSITION FOR NEXT TIME!
        console.log(`🎯 Success! Updating cached position from ${effectivePosition} to ${rescannedPosition} for future runs`);
        
        // Save the correct position to LocalStorage so next time we use it
        await LocalStorage.setItem("cachedAirPodsPosition", rescannedPosition.toString());
        await LocalStorage.setItem("lastSuccessfulPosition", rescannedPosition.toString());
        
        if (prefs.showHudNC) {
          const positionNote = rescannedPosition !== effectivePosition ? " - Position Fixed & Saved" : " - Retry Success";
          showHUD(`${retryRes} (${detection.airpodsType})${positionNote}`);
        }
      } else {
        // Still failed after retry
        console.log("❌ Both attempts failed even with proper timing");
        showHUD(`❌ Toggle failed - position ${effectivePosition}→${rescannedPosition}`);
      }
    } else {
      // Success on first try - also cache this position as successful
      console.log(`✅ First attempt succeeded with position ${effectivePosition}`);
      await LocalStorage.setItem("cachedAirPodsPosition", effectivePosition.toString());
      
      if (prefs.showHudNC && res) {
        showHUD(`${res} (${detection.airpodsType})`);
      }
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
