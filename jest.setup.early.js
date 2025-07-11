// Early Jest setup - must run before other modules

// Mock process.stdout for jest-util
if (typeof process !== 'undefined' && !process.stdout) {
  process.stdout = {
    isTTY: false,
    write: () => {},
  };
}

// Mock process.stderr for jest-util
if (typeof process !== 'undefined' && !process.stderr) {
  process.stderr = {
    isTTY: false,
    write: () => {},
  };
}

// Mock process.listeners for Jest environment
if (typeof process !== 'undefined' && !process.listeners) {
  process.listeners = () => [];
}

if (typeof process !== 'undefined' && !process.on) {
  process.on = () => {};
}

if (typeof process !== 'undefined' && !process.removeListener) {
  process.removeListener = () => {};
}