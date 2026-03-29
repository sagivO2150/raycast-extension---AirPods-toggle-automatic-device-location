import { platform, release } from "os";

function isDarwin() {
  return platform() === "darwin";
}

function getDarwinMajorVersion() {
  return parseInt(release().split(".")[0]);
}

export function isSequoia() {
  if (!isDarwin()) return false;

  // A mapping between Darwin and macOS is available at http://en.wikipedia.org/wiki/Darwin_%28operating_system%29#Release_history
  // Only Darwin 24 (macOS Sequoia 15) uses (i+1) for disclosure triangle.
  // Darwin 25+ (macOS 26) reverted to (i-1), same as pre-Sequoia.
  return getDarwinMajorVersion() === 24;
}

export function hasOffMode() {
  if (!isDarwin()) return true;

  // macOS 26+ (Darwin 25+) removed the "Off" option from noise control modes.
  // Modes are now: Transparency=1, Adaptive=2, Noise Cancellation=3
  // Previous versions had: Off=1, Transparency=2, Adaptive=3, Noise Cancellation=4
  return getDarwinMajorVersion() < 25;
}
