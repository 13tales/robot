const main = (): boolean => {
  console.log('Hello, world!');

  return true; // Return value to make it testable
};

// Use a flag to determine if this is being run directly or imported
const isRunningDirectly =
  process.argv[1]?.endsWith('src/index.ts') || process.argv[1]?.endsWith('index.ts');

// Only call main if this file is run directly
if (isRunningDirectly) {
  main();
}

// Export for testing
export { main };
