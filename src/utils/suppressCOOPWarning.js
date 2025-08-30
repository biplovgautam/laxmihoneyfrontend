// Utility to suppress Cross-Origin-Opener-Policy warnings
// This is a cosmetic fix as the functionality still works

const originalConsoleError = console.error;

console.error = (...args) => {
  // Suppress COOP policy warnings as they don't affect functionality
  if (
    args.some(arg => 
      typeof arg === 'string' && 
      arg.includes('Cross-Origin-Opener-Policy policy would block the window.closed call')
    )
  ) {
    return; // Suppress this specific warning
  }
  
  // Allow all other console.error messages
  originalConsoleError.apply(console, args);
};

export default {};
