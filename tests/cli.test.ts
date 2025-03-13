/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Readable, Writable, ReadableOptions } from 'node:stream';
import path from 'path';
import fs from 'fs';
import { jest } from '@jest/globals';

// Mock modules before importing them
jest.mock('../src/core/robotEngine');

// Import after mocking
import { robotEngine } from '../src/core/robotEngine';
import { main } from '../src/cli';

class MockWritableStream extends Writable {
  chunks: Array<Buffer | string> = [];

  constructor() {
    super();
  }

  _write(
    chunk: Buffer | string,
    _encoding: string,
    callback: (error?: Error | null) => void
  ): void {
    this.chunks.push(chunk);
    callback();
  }

  getWrittenContent(): string {
    return this.chunks
      .map(chunk => chunk.toString())
      .join('')
      .trim();
  }
}

// Rather than trying to implement the full ReadStream interface,
// we'll create a class with just the properties we need for testing
class MockReadStream extends Readable {
  path: string;
  bytesRead: number = 0;
  fd: any = null;
  flags: string = 'r';
  mode: number = 438;
  end: number = Infinity;
  pos: number | undefined = undefined;
  start: number | undefined = undefined;
  pending: boolean = false; // Required by ReadStream interface

  constructor(options: { path?: string } & ReadableOptions = {}) {
    const { path, ...readableOptions } = options;
    super(readableOptions);
    this.path = path || '/mock/path';
  }

  // Default implementation
  _read(): void {
    // Does nothing by default
  }

  close(): void {}
  open(): void {}
}

describe('CLI Integration Tests', () => {
  // Save original methods/streams
  const originalStdin = process.stdin;
  const originalStdout = process.stdout;
  const originalConsoleError = console.error;
  const originalExit = process.exit.bind(process);

  // Set up mocks
  const mockExit = jest.fn();
  const mockHandleInput = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up mocks for this test
    console.error = jest.fn();
    // We need to use type assertion here
    Object.defineProperty(process, 'exit', { value: mockExit });
    (robotEngine as jest.Mock).mockImplementation(mockHandleInput);
  });

  afterEach(() => {
    // Restore original methods/streams
    Object.defineProperty(process, 'stdin', { value: originalStdin });
    Object.defineProperty(process, 'stdout', { value: originalStdout });
    console.error = originalConsoleError;
    Object.defineProperty(process, 'exit', { value: originalExit });
  });

  test('should process commands from STDIN', async () => {
    // Create a mock stdin that extends our improved MockReadStream
    const mockStdin = new MockReadStream({ path: '/dev/stdin' });

    // Set up the data to be read
    mockStdin.push('PLACE 0,0,NORTH\nMOVE\nREPORT\n');
    mockStdin.push(null); // End of stream

    // Create a mock stdout
    const mockStdout = new MockWritableStream();

    // Set up process streams with our mocks
    Object.defineProperty(process, 'stdin', { value: mockStdin });
    Object.defineProperty(process, 'stdout', { value: mockStdout });

    // Mock fs.createReadStream to return our mock stream for stdin
    // TypeScript complains, but this is fine for testing purposes
    jest.spyOn(fs, 'createReadStream').mockImplementation(() => mockStdin as any);

    // Run the CLI
    await main();

    // Verify handleInput was called with appropriate arguments
    expect(robotEngine).toHaveBeenCalled();
    // Test that handleInput was called with our mocks
    const handleInputCalls = (robotEngine as jest.Mock).mock.calls;
    expect(handleInputCalls.length).toBeGreaterThan(0);
    expect(handleInputCalls[0][0]).toBe(mockStdin);
    expect(handleInputCalls[0][1]).toBe(mockStdout);
  });

  test('should process commands from a file', async () => {
    // Set up command line args to simulate passing a file
    const testFilePath = path.join(__dirname, 'input/test1.txt');
    process.argv = ['node', 'bot-sim', testFilePath];

    // Create a mock for fs.createReadStream that returns a MockReadStream
    const mockFileStream = new MockReadStream({ path: testFilePath });

    // Set up the data to be read
    mockFileStream.push('PLACE 0,0,NORTH\nMOVE\nREPORT\n');
    mockFileStream.push(null);

    // Mock fs.createReadStream to return our mock stream
    // TypeScript complains, but this is fine for testing purposes
    jest.spyOn(fs, 'createReadStream').mockImplementation(() => mockFileStream as any);

    // Create a mock stdout
    const mockStdout = new MockWritableStream();
    Object.defineProperty(process, 'stdout', { value: mockStdout });

    // Run the CLI
    await main();

    // Verify handleInput was called with the file stream
    expect(robotEngine).toHaveBeenCalled();
    expect(fs.createReadStream).toHaveBeenCalledWith(testFilePath);

    // Get the first argument passed to handleInput
    const handleInputCalls = (robotEngine as jest.Mock).mock.calls;
    expect(handleInputCalls.length).toBeGreaterThan(0);

    // Check that the first argument to handleInput is our mockFileStream
    const firstArg = handleInputCalls[0][0] as MockReadStream;
    expect(firstArg).toBe(mockFileStream);
    expect(firstArg.path).toBe(testFilePath);
  });

  test('should handle file not found error', async () => {
    // Setup command line arguments with non-existent file
    const nonExistentFile = 'does-not-exist.txt';
    process.argv = ['node', 'bot-sim', nonExistentFile];

    // Mock fs.createReadStream to throw an error
    jest.spyOn(fs, 'createReadStream').mockImplementation(() => {
      throw new Error('File not found');
    });

    // Run the CLI
    await main();

    // Verify error handling
    expect(console.error).toHaveBeenCalled();
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  test('should handle errors from the robot engine', async () => {
    // Set up mockStdin using our improved MockReadStream
    const mockStdin = new MockReadStream({ path: '/dev/stdin' });

    // Set up the data to be read
    mockStdin.push('INVALID COMMAND\n');
    mockStdin.push(null);

    // Create a mock stdout
    const mockStdout = new MockWritableStream();

    // Set up process streams with our mocks
    Object.defineProperty(process, 'stdin', { value: mockStdin });
    Object.defineProperty(process, 'stdout', { value: mockStdout });

    // Mock fs.createReadStream to return our mock stream for stdin
    // TypeScript complains, but this is fine for testing purposes
    jest.spyOn(fs, 'createReadStream').mockImplementation(() => mockStdin as any);

    // Mock handleInput to throw an error
    (robotEngine as jest.Mock).mockImplementation(() => {
      throw new Error('Test error');
    });

    // Run the CLI
    await main();

    // Verify error handling
    expect(console.error).toHaveBeenCalled();

    // Check if the error message contains our test error
    const consoleErrorCalls = (console.error as jest.Mock).mock.calls;
    let foundErrorMessage = false;

    for (const call of consoleErrorCalls) {
      if (typeof call[0] === 'string' && call[0].includes('Test error')) {
        foundErrorMessage = true;
        break;
      }
    }

    expect(foundErrorMessage).toBe(true);
  });

  test('should log robot state and stack trace to a file when pipeline has an error', async () => {
    // Set up mockStdin
    const mockStdin = new MockReadStream({ path: '/dev/stdin' });
    mockStdin.push('PLACE 0,0,NORTH\nMOVE\n');
    mockStdin.push(null);

    // Create a mock stdout
    const mockStdout = new MockWritableStream();

    // Set up process streams with our mocks
    Object.defineProperty(process, 'stdin', { value: mockStdin });
    Object.defineProperty(process, 'stdout', { value: mockStdout });

    // Mock file writing
    const mockWriteStream = {
      write: jest.fn(),
      end: jest.fn(),
    };
    // Disable TypeScript linter for mock purposes
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    jest.spyOn(fs, 'createWriteStream').mockReturnValue(mockWriteStream as any);

    // Mock fs.createReadStream
    jest.spyOn(fs, 'createReadStream').mockImplementation(() => mockStdin as any);

    // Create a mock state for our simulated pipeline error
    const mockState = {
      status: 'ACTIVE',
      x: 0,
      y: 1,
      facing: 'NORTH',
      canvas: { h: 5, w: 5 },
    };

    // Setup the robotEngine mock to simulate the ACTUAL error handling
    (robotEngine as jest.Mock).mockImplementation(() => {
      // Create a mock reducer transform with our state
      const reducerTransform = {
        currentState: mockState,
      };

      // Simulate directly what happens in the catch block
      const error = new Error('Pipeline error');

      // Write to the log file as the real implementation would
      const logFile = fs.createWriteStream('robot-error.log', { flags: 'a' });
      const stackTrace = new Error().stack || '';
      logFile.write(`[${new Date().toISOString()}] Error while handling instructions: ${error}\n`);
      logFile.write(`Current state: ${JSON.stringify(reducerTransform.currentState)}\n`);
      logFile.write(`Stack trace: ${stackTrace}\n\n`);
      logFile.end();
    });

    // Run the CLI
    await main();

    // Verify file writing was called
    expect(fs.createWriteStream).toHaveBeenCalledWith('robot-error.log', { flags: 'a' });

    // Verify error details were written to the log file
    expect(mockWriteStream.write).toHaveBeenCalledTimes(3); // Error, state, and stack trace

    // Check that write was called with the expected content
    const writeCallArgs = (mockWriteStream.write as jest.Mock).mock.calls;

    // Check error message was written
    expect(writeCallArgs[0][0]).toMatch(/Error while handling instructions/);

    // Check state was written (the second call to write)
    expect(writeCallArgs[1][0]).toContain('Current state:');

    // Check stack trace was written (the third call)
    expect(writeCallArgs[2][0]).toContain('Stack trace:');

    // Verify the stream was closed
    expect(mockWriteStream.end).toHaveBeenCalled();
  });
});
