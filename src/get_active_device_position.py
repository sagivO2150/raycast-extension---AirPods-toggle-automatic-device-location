#!/usr/bin/env python3

import subprocess
import sys

def get_active_device_position():
    """Get the position of the currently active audio device"""
    
    script = '''
tell application "System Events"
    tell application process "ControlCenter"
        try
            -- Open Sound menu
            set menuBar to (first menu bar item whose description is "Sound") of menu bar 1
            tell menuBar to click
            delay 0.3
            
            -- Get the menu
            set btMenu to (scroll area 1 of group 1 of window "Control Center")
            
            -- Check positions 1-5 (the actual devices)
            set activePosition to 0
            repeat with i from 1 to 5
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
            return "ERROR: " & errMsg
        end try
    end tell
end tell
'''
    
    try:
        result = subprocess.run(['osascript', '-e', script], 
                              capture_output=True, text=True, timeout=10)
        
        if result.returncode != 0:
            print(f"Error: {result.stderr}")
            return None
        
        output = result.stdout.strip()
        
        if output.startswith("ERROR:"):
            print(output)
            return None
        
        position = int(output)
        
        if position > 0:
            print(f"Active device is at position: {position}")
            return position
        else:
            print("No active device found in positions 1-5")
            return None
            
    except ValueError:
        print(f"Unexpected output: {output}")
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    # If called with --quiet, just return the position number
    if len(sys.argv) > 1 and sys.argv[1] == "--quiet":
        position = get_active_device_position()
        if position:
            print(position)
    else:
        get_active_device_position()
