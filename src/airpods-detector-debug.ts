import { runAppleScript } from "@raycast/utils";
import { Prefs } from "./type";

export interface AirPodsDetectionResult {
  isConnected: boolean;
  deviceName?: string;
  airpodsType?: "AirPods Pro" | "AirPods Max" | "AirPods 4";
  position: number;
}

// New function to get the active device position dynamically
export async function getActiveDevicePosition(prefs?: Prefs): Promise<number> {
  console.log("🔍 Getting active device position...");
  
  // Universal approach: Use system_profiler to get device list and match with Control Center positions
  const universalScript = `
tell application "System Events"
    tell application process "ControlCenter"
        try
            -- Try multiple common localizations for Sound menu
            set soundMenuNames to {"Sound", "Ton", "Son", "Sonido", "Som", "Suono", "Audio", "Áudio"}
            set ccMenuNames to {"Control Center", "Control Centre", "Kontrollzentrum", "Centre de contrôle", "Centro de Control", "Centro de Controle", "Centro di Controllo"}
            
            set foundSoundMenu to false
            set soundMenuName to "Sound"
            set ccMenuName to "Control Center"
            
            -- Try to find Sound menu with different localizations
            repeat with soundName in soundMenuNames
                try
                    set testMenu to (first menu bar item whose description is soundName as string) of menu bar 1
                    set soundMenuName to soundName as string
                    set foundSoundMenu to true
                    exit repeat
                on error
                    -- Continue to next localization
                end try
            end repeat
            
            if not foundSoundMenu then
                -- Fallback: try to find any menu that might be Sound (look for audio-related keywords)
                set allMenuItems to (every menu bar item of menu bar 1)
                repeat with menuItem in allMenuItems
                    set menuDesc to description of menuItem
                    if menuDesc contains "ound" or menuDesc contains "udio" or menuDesc contains "on" then
                        set soundMenuName to menuDesc
                        set foundSoundMenu to true
                        exit repeat
                    end if
                end repeat
            end if
            
            if not foundSoundMenu then
                return "ERROR: Sound menu not found with any localization"
            end if
            
            -- Try to find Control Center window with different localizations
            set foundCCWindow to false
            repeat with ccName in ccMenuNames
                try
                    -- Test if window exists
                    set testWindow to window ccName
                    set ccMenuName to ccName as string
                    set foundCCWindow to true
                    exit repeat
                on error
                    -- Continue to next localization
                end try
            end repeat
            
            -- Open Sound menu
            set menuBar to (first menu bar item whose description is soundMenuName) of menu bar 1
            tell menuBar to click
            delay 0.5
            
            -- Get the menu - try different window names
            set btMenu to missing value
            if foundCCWindow then
                try
                    set btMenu to (scroll area 1 of group 1 of window ccMenuName)
                on error
                    -- Fallback to first available window
                    set btMenu to (scroll area 1 of group 1 of window 1)
                end try
            else
                -- Fallback to first available window
                set btMenu to (scroll area 1 of group 1 of window 1)
            end if
            
            -- Check positions 1-15 (covering even more possible positions)
            set activePosition to 0
            repeat with i from 1 to 15
                try
                    set cb to checkbox i of btMenu
                    set cbValue to value of cb
                    
                    if cbValue is 1 then
                        set activePosition to i
                        exit repeat
                    end if
                on error
                    -- Position doesn't exist, continue
                end try
            end repeat
            
            -- Close menu
            tell menuBar to click
            
            -- Return just the position number
            return activePosition as string
            
        on error errMsg
            -- Close menu if error occurs
            try
                set menuBar to (first menu bar item whose description is soundMenuName) of menu bar 1
                tell menuBar to click
            end try
            return "ERROR: " & errMsg
        end try
    end tell
end tell
`;

  try {
    const result = await runAppleScript<string>(universalScript, { timeout: 15000 });
    
    if (result.startsWith("ERROR:")) {
      console.error("❌ Universal position detection failed:", result);
      console.log("🔄 Falling back to preferences-based detection...");
      
      // Fallback to the original method if user has configured localization
      if (prefs?.soundLoc && prefs?.ccLoc) {
        return await getActiveDevicePositionWithPrefs(prefs);
      }
      
      // Ultimate fallback
      console.log("⚠️ Using ultimate fallback position 4");
      return 4;
    }
    
    const position = parseInt(result);
    
    if (position > 0) {
      console.log("✅ Universal active device position found:", position);
      return position;
    } else {
      console.log("❌ No active device found with universal method");
      
      // Try preferences-based fallback
      if (prefs?.soundLoc && prefs?.ccLoc) {
        console.log("🔄 Trying preferences-based detection...");
        return await getActiveDevicePositionWithPrefs(prefs);
      }
      
      console.log("⚠️ Using ultimate fallback position 4");
      return 4;
    }
    
  } catch (error) {
    console.error("❌ Failed to get active position:", error);
    
    // Try preferences-based fallback
    if (prefs?.soundLoc && prefs?.ccLoc) {
      console.log("🔄 Trying preferences-based detection as fallback...");
      try {
        return await getActiveDevicePositionWithPrefs(prefs);
      } catch (fallbackError) {
        console.error("❌ Fallback also failed:", fallbackError);
      }
    }
    
    // Ultimate fallback
    console.log("⚠️ Using ultimate fallback position 4");
    return 4;
  }
}

// Helper function for preferences-based detection (original method)
async function getActiveDevicePositionWithPrefs(prefs: Prefs): Promise<number> {
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

  const result = await runAppleScript<string>(script, { timeout: 10000 });
  
  if (result.startsWith("ERROR:")) {
    throw new Error(result);
  }
  
  const position = parseInt(result);
  if (position > 0) {
    return position;
  } else {
    throw new Error("No active device found");
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

    // Step 1: Use system_profiler to get the default output device first
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
      const contains4 = /airpods\s*4/i.test(cleanDeviceName);
      console.log("🔍 Contains 'max':", containsMax, "Contains '4':", contains4);

      const airpodsType: "AirPods Pro" | "AirPods Max" | "AirPods 4" = containsMax ? "AirPods Max" : contains4 ? "AirPods 4" : "AirPods Pro";
      console.log("🎯 Detected type:", airpodsType);

      // Step 2: ONLY scan for position if we don't have a cached preference position
      // This avoids opening Control Center unnecessarily
      let detectedPosition = prefs?.airpodsIndex
        ? parseInt(prefs.airpodsIndex.toString())
        : 4;

      console.log("🎯 Using cached/default position:", detectedPosition, "(will scan only if toggle fails)");

      return {
        isConnected: true,
        deviceName: cleanDeviceName,
        airpodsType,
        position: detectedPosition, // Use cached position, scan only if needed later
      };
    }

    // Enhanced fallback: Check for other Apple audio devices that might support noise control
    if (cleanDeviceName.toLowerCase().includes("beats") && 
        (cleanDeviceName.toLowerCase().includes("studio") || cleanDeviceName.toLowerCase().includes("solo"))) {
      console.log("✅ Found Beats device with potential noise control support");
      
      let detectedPosition = prefs?.airpodsIndex
        ? parseInt(prefs.airpodsIndex.toString())
        : 4;

      // Treat as AirPods Pro for noise control options
      return {
        isConnected: true,
        deviceName: cleanDeviceName,
        airpodsType: "AirPods Pro",
        position: detectedPosition,
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
  airpodsType: "AirPods Pro" | "AirPods Max" | "AirPods 4",
): {
  optionOne: string;
  optionTwo: string;
} {
  console.log("🎛️ Getting default options for:", airpodsType);

  console.log(`🎧 ${airpodsType}: Using Noise Cancellation ↔ Transparency`);
  return {
    optionOne: "Noise Cancellation",
    optionTwo: "Transparency",
  };
}
