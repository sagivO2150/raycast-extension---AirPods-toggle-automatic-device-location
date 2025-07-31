#!/usr/bin/env python3
"""
Script to list audio output devices using PyObjC to match system ordering.
"""

try:
    from Foundation import NSObject
    from AppKit import NSWorkspace
    import objc
    
    # Load the CoreAudio framework
    objc.loadBundle('CoreAudio', globals(), 
                    bundle_path='/System/Library/Frameworks/CoreAudio.framework')
    
    # Define the necessary constants
    kAudioHardwarePropertyDevices = objc._C_UINT32.pack(ord('d') << 24 | ord('e') << 16 | ord('v') << 8 | ord('#'))
    kAudioHardwarePropertyDefaultOutputDevice = objc._C_UINT32.pack(ord('d') << 24 | ord('O') << 16 | ord('u') << 8 | ord('t'))
    kAudioObjectPropertyScopeGlobal = objc._C_UINT32.pack(ord('g') << 24 | ord('l') << 16 | ord('b') << 8 | ord('l'))
    kAudioObjectPropertyElementMain = 0
    kAudioDevicePropertyDeviceName = objc._C_UINT32.pack(ord('n') << 24 | ord('a') << 16 | ord('m') << 8 | ord('e'))
    
    print("PyObjC method requires installation: pip install pyobjc-framework-CoreAudio")
    
except ImportError:
    pass

# Fallback method using system_profiler with different parsing
import subprocess
import re
from collections import OrderedDict

def get_audio_devices_system_order():
    """Get audio devices attempting to match macOS menu bar order."""
    
    # First, let's get all devices from system_profiler
    try:
        result = subprocess.run(
            ['system_profiler', 'SPAudioDataType', '-detailLevel', 'mini'],
            capture_output=True,
            text=True,
            check=True
        )
        
        # Parse output to find all output devices
        devices = OrderedDict()
        current_device = None
        is_output = False
        is_default = False
        
        for line in result.stdout.split('\n'):
            # Check for device name
            device_match = re.match(r'^\s{8}([^:]+):$', line)
            if device_match:
                current_device = device_match.group(1).strip()
                is_output = False
                is_default = False
                continue
            
            # Check if it's an output device
            if current_device and 'Output Channels:' in line:
                is_output = True
            
            # Check if it's the default output
            if current_device and 'Default Output Device: Yes' in line:
                is_default = True
            
            # If we've determined it's an output device, add it
            if current_device and is_output and 'Transport:' in line:
                devices[current_device] = {
                    'is_default': is_default,
                    'transport': line.split(':')[1].strip()
                }
                current_device = None
        
        # Now let's order them in a way that might match the menu bar
        # The menu bar typically shows: Built-in first, then external monitors, then Bluetooth
        ordered_devices = []
        
        # First add built-in devices
        for name, info in devices.items():
            if info['transport'] == 'Built-in':
                ordered_devices.append(name)
        
        # Then add DisplayPort/HDMI devices
        for name, info in devices.items():
            if info['transport'] in ['DisplayPort', 'HDMI']:
                ordered_devices.append(name)
        
        # Then add Bluetooth devices
        for name, info in devices.items():
            if info['transport'] == 'Bluetooth':
                ordered_devices.append(name)
        
        # Finally add any remaining devices
        for name, info in devices.items():
            if name not in ordered_devices:
                ordered_devices.append(name)
        
        return ordered_devices
        
    except subprocess.CalledProcessError as e:
        print(f"Error running system_profiler: {e}")
        return []

def main():
    """Main function to list audio devices."""
    print("Audio Output Devices (attempting to match menu bar order):")
    print("-" * 60)
    
    devices = get_audio_devices_system_order()
    
    if not devices:
        print("No audio output devices found.")
        return
    
    for position, device in enumerate(devices, 1):
        print(f"{position}. {device}")
        if "AirPods" in device:
            print(f"   ^ Your AirPods are at position {position}")
    
    print("-" * 60)
    print(f"Total devices found: {len(devices)}")
    print("\nNote: The exact order shown in the menu bar may differ slightly")
    print("as macOS may use additional criteria for sorting.")

if __name__ == "__main__":
    main()
