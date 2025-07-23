#!/usr/bin/env node

// Debug script to test AirPods Max detection and configuration
const { exec } = require('child_process');

console.log('🐛 Debug: Testing AirPods Max Auto-Detection\n');

// Test the system command
const command = "system_profiler SPAudioDataType | grep -B 10 'Default Output Device: Yes' | grep '^[[:space:]]*[^[:space:]].*:$' | tail -1 | sed 's/:$//' | sed 's/^[[:space:]]*//'";

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error running command:', error);
    return;
  }
  
  const deviceName = stdout.trim();
  console.log(`🔍 Raw device name: "${deviceName}"`);
  console.log(`🔍 Device name lowercase: "${deviceName.toLowerCase()}"`);
  
  // Test the detection logic
  const cleanName = deviceName.trim().toLowerCase();
  
  if (cleanName.includes("airpods")) {
    console.log('✅ Contains "airpods"');
    
    if (cleanName.includes("max")) {
      console.log('✅ Contains "max" - should be detected as AirPods Max');
      console.log('📋 Expected configuration:');
      console.log('   - Type: AirPods Max');
      console.log('   - Position: 4');
      console.log('   - Option One: Noise Cancellation');
      console.log('   - Option Two: Transparency');
    } else {
      console.log('⚠️  Does NOT contain "max" - would be detected as AirPods Pro');
    }
  } else {
    console.log('❌ Does NOT contain "airpods"');
  }
  
  console.log('\n🧪 Testing AppleScript command execution...');
  
  // Test the AppleScript command structure
  const testScript = `
    set command to "system_profiler SPAudioDataType | grep -B 10 'Default Output Device: Yes' | grep '^[[:space:]]*[^[:space:]].*:$' | tail -1 | sed 's/:$//' | sed 's/^[[:space:]]*//' "
    set deviceName to do shell script command
    return deviceName
  `;
  
  console.log('AppleScript command to test:');
  console.log(testScript);
});
