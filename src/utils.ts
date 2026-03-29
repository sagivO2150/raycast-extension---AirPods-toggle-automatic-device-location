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


