#!/usr/bin/env node

// Debug script to determine AirPods Max checkbox positions
const { exec } = require('child_process');

console.log('🐛 Debug: AirPods Max Checkbox Positions\n');

// Test clicking different checkbox positions to see what happens
const testScript = `
tell application "System Events"
	tell application process "ControlCenter"
		try
			set menuBar to (first menu bar item whose description is "Sound") of menu bar 1
			tell menuBar to click
			delay 0.5
			
			set btMenu to (scroll area 1 of group 1 of window "Control Center")
			set btMenuElements to entire contents of btMenu
			
			-- Find AirPods Max checkbox (position 4)
			set airpodsCheckbox to checkbox 4 of btMenu
			log "AirPods checkbox found at position 4"
			
			-- Try to find and log positions of noise control options
			repeat with i from 1 to 10
				try
					set testCheckbox to checkbox (4 + i) of btMenu
					set checkboxValue to value of testCheckbox as boolean
					set checkboxTitle to title of testCheckbox as string
					log "Position " & (4 + i) & ": " & checkboxTitle & " (checked: " & checkboxValue & ")"
				on error
					-- Position doesn't exist, stop
					exit repeat
				end try
			end repeat
			
			tell menuBar to click
			return "Debug complete"
		on error errorMsg
			tell menuBar to click
			return "Error: " & errorMsg
		end try
	end tell
end tell
`;

exec(`osascript -e '${testScript.replace(/'/g, "\\'")}'`, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log('📋 AppleScript output:');
  console.log(stdout);
  
  if (stderr) {
    console.log('⚠️ Warnings:');
    console.log(stderr);
  }
});
