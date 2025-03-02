import { main } from '../src/index.js';

// Mock console.log to prevent output during tests
const originalConsoleLog = console.log;
beforeEach(() => {
  console.log = jest.fn();
});

afterEach(() => {
  console.log = originalConsoleLog;
});

describe('Main application', () => {
  test('main function should return true', () => {
    const result = main();
    expect(result).toBe(true);
  });

  test('main function should log to console', () => {
    main();
    expect(console.log).toHaveBeenCalledWith('Hello, world!');
  });
});
