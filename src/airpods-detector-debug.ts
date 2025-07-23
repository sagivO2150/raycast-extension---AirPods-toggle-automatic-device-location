import { runAppleScript } from "@raycast/utils";
import { Prefs } from "./type";

export interface AirPodsDetectionResult {
  isConnected: boolean;
  deviceName?: string;
  airpodsType?: "AirPods Pro" | "AirPods Max";
  position: number;
}

export async function detectConnectedAirPods(
  prefs?: Prefs,
): Promise<AirPodsDetectionResult> {
  try {
    // Only use manual overrides if explicitly set (not from auto-detection)
    // We'll skip manual overrides for now to test auto-detection
    console.log("� Skipping manual overrides to test auto-detection");
    console.log("📋 Current prefs:", prefs);

    // Use system_profiler to get the default output device
    const script = `
      set command to "system_profiler SPAudioDataType | grep -B 10 'Default Output Device: Yes' | grep '^[[:space:]]*[^[:space:]].*:$' | tail -1 | sed 's/:$//' | sed 's/^[[:space:]]*//' "
      set deviceName to do shell script command
      return deviceName
    `;

    let deviceName: string | undefined = undefined;
    try {
      deviceName = await runAppleScript<string>(script, { timeout: 10000 }); // 10s timeout
    } catch (error) {
      console.error("AppleScript timed out or failed:", error);
      return {
        isConnected: false,
        position: prefs?.airpodsIndex
          ? parseInt(prefs.airpodsIndex.toString())
          : 4,
      };
    }

    console.log("🔍 Raw device name from AppleScript:", `"${deviceName}"`);

    if (!deviceName || deviceName.trim() === "") {
      console.log("❌ No device name detected");
      return {
        isConnected: false,
        position: prefs?.airpodsIndex
          ? parseInt(prefs.airpodsIndex.toString())
          : 4,
      };
    }

    const cleanDeviceName = deviceName.trim();
    console.log("🧹 Cleaned device name:", `"${cleanDeviceName}"`);
    console.log(
      "🔍 Lowercase device name:",
      `"${cleanDeviceName.toLowerCase()}"`,
    );

    // Check if it's AirPods and determine the type
    if (cleanDeviceName.toLowerCase().includes("airpods")) {
      console.log("✅ Contains 'airpods'");

      const containsMax = cleanDeviceName.toLowerCase().includes("max");
      console.log("🔍 Contains 'max':", containsMax);

      const airpodsType = containsMax ? "AirPods Max" : "AirPods Pro";
      console.log("🎯 Detected type:", airpodsType);

      return {
        isConnected: true,
        deviceName: cleanDeviceName,
        airpodsType,
        position: prefs?.airpodsIndex
          ? parseInt(prefs.airpodsIndex.toString())
          : 4,
      };
    }

    // Not an AirPods device
    console.log("❌ Not an AirPods device");
    return {
      isConnected: false,
      position: prefs?.airpodsIndex
        ? parseInt(prefs.airpodsIndex.toString())
        : 4,
    };
  } catch (error) {
    console.error("Error detecting AirPods:", error);
    return {
      isConnected: false,
      position: prefs?.airpodsIndex
        ? parseInt(prefs.airpodsIndex.toString())
        : 4,
    };
  }
}

export function getDefaultOptionsForAirPodsType(
  airpodsType: "AirPods Pro" | "AirPods Max",
): {
  optionOne: string;
  optionTwo: string;
} {
  console.log("🎛️ Getting default options for:", airpodsType);

  if (airpodsType === "AirPods Max") {
    console.log("🎧 AirPods Max: Using Noise Cancellation ↔ Transparency");
    return {
      optionOne: "Noise Cancellation",
      optionTwo: "Transparency",
    };
  } else {
    // AirPods Pro
    console.log("🎧 AirPods Pro: Using Noise Cancellation ↔ Adaptive");
    return {
      optionOne: "Noise Cancellation",
      optionTwo: "Adaptive",
    };
  }
}
