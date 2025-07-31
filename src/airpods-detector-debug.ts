import { runAppleScript } from "@raycast/utils";
import { Prefs } from "./type";

export interface AirPodsDetectionResult {
  isConnected: boolean;
  deviceName?: string;
  airpodsType?: "AirPods Pro" | "AirPods Max";
  position: number;
}

// New function to get the active device position dynamically
export async function getActiveDevicePosition(prefs: Prefs): Promise<number> {
  console.log("🔍 Getting active device position...");
  
  const script = `
tell application "System Events"
    tell application process "ControlCenter"
        try
            -- Open Sound menu
            set menuBar to (first menu bar item whose description is "${prefs.soundLoc}") of menu bar 1
            tell menuBar to click
            delay 0.3
            
            -- Get the menu
            set btMenu to (scroll area 1 of group 1 of window "${prefs.ccLoc}")
            
            -- Check positions 1-10 (covering more possible positions)
            set activePosition to 0
            repeat with i from 1 to 10
                try
                    set cb to checkbox i of btMenu
                    set cbValue to value of cb
                    
                    if cbValue is 1 then
                        set activePosition to i
                        exit repeat
                    end if
                end try
            end repeat
            
            -- Close menu
            tell menuBar to click
            
            -- Return just the position number
            return activePosition as string
            
        on error errMsg
            -- Close menu if error occurs
            try
                tell menuBar to click
            end try
            return "ERROR: " & errMsg
        end try
    end tell
end tell
`;

  try {
    const result = await runAppleScript<string>(script, { timeout: 10000 });
    
    if (result.startsWith("ERROR:")) {
      console.error("❌ Error getting active position:", result);
      // Fallback to preference or default
      return prefs?.airpodsIndex ? parseInt(prefs.airpodsIndex.toString()) : 4;
    }
    
    const position = parseInt(result);
    
    if (position > 0) {
      console.log("✅ Active device position found:", position);
      return position;
    } else {
      console.log("❌ No active device found, using fallback");
      return prefs?.airpodsIndex ? parseInt(prefs.airpodsIndex.toString()) : 4;
    }
    
  } catch (error) {
    console.error("❌ Failed to get active position:", error);
    // Fallback to preference or default
    return prefs?.airpodsIndex ? parseInt(prefs.airpodsIndex.toString()) : 4;
  }
}

export async function detectConnectedAirPods(
  prefs?: Prefs,
): Promise<AirPodsDetectionResult> {
  try {
    // Only use manual overrides if explicitly set (not from auto-detection)
    // We'll skip manual overrides for now to test auto-detection
    console.log("🚫 Skipping manual overrides to test auto-detection");
    console.log("📋 Current prefs:", prefs);

    // Step 1: Get the dynamic position of the currently active device
    const dynamicPosition = prefs ? await getActiveDevicePosition(prefs) : 4;
    console.log("🎯 Dynamic position detected:", dynamicPosition);

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
        position: dynamicPosition, // Use dynamic position instead of hardcoded
      };
    }

    console.log("🔍 Raw device name from AppleScript:", `"${deviceName}"`);

    if (!deviceName || deviceName.trim() === "") {
      console.log("❌ No device name detected");
      return {
        isConnected: false,
        position: dynamicPosition, // Use dynamic position instead of hardcoded
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
        position: dynamicPosition, // Use dynamic position instead of hardcoded
      };
    }

    // Not an AirPods device
    console.log("❌ Not an AirPods device");
    return {
      isConnected: false,
      position: dynamicPosition, // Use dynamic position instead of hardcoded
    };
  } catch (error) {
    console.error("Error detecting AirPods:", error);
    const fallbackPosition = prefs?.airpodsIndex
      ? parseInt(prefs.airpodsIndex.toString())
      : 4;
    return {
      isConnected: false,
      position: fallbackPosition,
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
    console.log("🎧 AirPods Pro: Using Noise Cancellation ↔ Transparency");
    return {
      optionOne: "Noise Cancellation",
      optionTwo: "Transparency",
    };
  }
}
