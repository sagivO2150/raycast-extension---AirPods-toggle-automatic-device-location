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
    // If manual overrides are provided in preferences, use them
    if (prefs?.airpodsType && prefs?.airpodsIndex) {
      return {
        isConnected: true,
        airpodsType: prefs.airpodsType as "AirPods Pro" | "AirPods Max",
        position: parseInt(prefs.airpodsIndex.toString()),
      };
    }

    // Use system_profiler to get the default output device
    const script = `
      set command to "system_profiler SPAudioDataType | grep -B 10 'Default Output Device: Yes' | grep '^[[:space:]]*[^[:space:]].*:$' | tail -1 | sed 's/:$//' | sed 's/^[[:space:]]*//' "
      set deviceName to do shell script command
      return deviceName
    `;

    const deviceName = await runAppleScript<string>(script);

    if (!deviceName || deviceName.trim() === "") {
      return {
        isConnected: false,
        position: prefs?.airpodsIndex
          ? parseInt(prefs.airpodsIndex.toString())
          : 4,
      };
    }

    const cleanDeviceName = deviceName.trim();

    // Check if it's AirPods and determine the type
    if (cleanDeviceName.toLowerCase().includes("airpods")) {
      const airpodsType = cleanDeviceName.toLowerCase().includes("max")
        ? "AirPods Max"
        : "AirPods Pro";
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
  if (airpodsType === "AirPods Max") {
    return {
      optionOne: "Noise Cancellation",
      optionTwo: "Transparency",
    };
  } else {
    // AirPods Pro
    return {
      optionOne: "Noise Cancellation",
      optionTwo: "Adaptive",
    };
  }
}
