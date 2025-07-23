#!/usr/bin/env node

// Test the actual AppleScript execution
const { exec } = require('child_process');

console.log('🧪 Testing AppleScript execution for AirPods Max...\n');

const appleScript = `
osascript -e '
set command to "system_profiler SPAudioDataType | grep -B 10 '\''Default Output Device: Yes'\'' | grep '\''^[[:space:]]*[^[:space:]].*:$'\'' | tail -1 | sed '\''s/:$//'\'' | sed '\''s/^[[:space:]]*//'\'' "
set deviceName to do shell script command
return deviceName
'
`;

exec(appleScript, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ AppleScript Error:', error);
    return;
  }
  
  if (stderr) {
    console.error('⚠️ AppleScript stderr:', stderr);
  }
  
  const deviceName = stdout.trim();
  console.log(`✅ AppleScript returned: "${deviceName}"`);
  
  // Test the detection logic as it would work in the extension
  const cleanName = deviceName.trim().toLowerCase();
  
  if (cleanName.includes("airpods") && cleanName.includes("max")) {
    console.log('✅ Would be detected as AirPods Max');
    console.log('📋 Configuration would be:');
    console.log('   - airpodsType: "AirPods Max"');
    console.log('   - airpodsIndex: 4');
    console.log('   - optionOne: "Noise Cancellation"');
    console.log('   - optionTwo: "Transparency"');
  } else {
    console.log('❌ Detection failed');
  }
});
