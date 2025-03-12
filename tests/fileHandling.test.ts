import fs from 'fs';
import path from 'path';
import { Writable } from 'node:stream';
import { robotEngine } from '../src/core/robotEngine';
import { generateTestDataFiles } from './generateTestData';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

// Mock writable stream to capture output
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

  // Helper method to get the written content as a string
  getWrittenContent(): string {
    return this.chunks
      .map(chunk => chunk.toString())
      .join('')
      .trim();
  }
}

describe('File Handling Tests', () => {
  // Temporary file paths for generated test data
  const testDir = path.join(__dirname, 'temp');
  const inputFilePath = path.join(testDir, 'testData.input.txt');
  const outputFilePath = path.join(testDir, 'testData.output.txt');

  // Create the temp directory if it doesn't exist
  beforeAll(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  // Clean up after tests
  afterAll(() => {
    // Remove temporary files if they exist
    if (fs.existsSync(inputFilePath)) {
      fs.unlinkSync(inputFilePath);
    }
    if (fs.existsSync(outputFilePath)) {
      fs.unlinkSync(outputFilePath);
    }

    // Remove the directory if it's empty
    try {
      fs.rmdirSync(testDir);
    } catch {
      // Ignore errors if directory isn't empty
    }
  });

  test('should process large test file correctly (1MB)', async () => {
    // Generate a larger test file (1MB) with a fixed seed for reproducibility
    const { inputPath, outputPath } = generateTestDataFiles(
      1, // 1 MB of test data
      inputFilePath,
      outputFilePath,
      67890 // Different fixed seed for this test
    );

    expect(fs.existsSync(inputPath)).toBeTruthy();
    expect(fs.existsSync(outputPath)).toBeTruthy();

    // Get expected output
    const expectedOutput = fs.readFileSync(outputPath, 'utf8').trim();

    // Create streams
    const inputStream = fs.createReadStream(inputPath, {
      encoding: 'utf8',
    });
    const outputStream = new MockWritableStream();

    try {
      // Process the input and wait for completion
      await robotEngine(inputStream, outputStream);

      // Check the output
      const actualOutput = outputStream.getWrittenContent();

      // If they don't match, log detailed diagnostics before the assertion fails
      if (actualOutput !== expectedOutput) {
        const actualLines = actualOutput.split('\n');
        const expectedLines = expectedOutput.split('\n');

        console.log(`Expected lines: ${expectedLines.length}, Actual lines: ${actualLines.length}`);

        // Find first difference
        for (let i = 0; i < Math.max(expectedLines.length, actualLines.length); i++) {
          if (expectedLines[i] !== actualLines[i]) {
            console.log(`First difference at line ${i + 1}:`);
            console.log(`Expected: "${expectedLines[i] || 'undefined'}" `);
            console.log(`Actual  : "${actualLines[i] || 'undefined'}" `);
            break;
          }
        }

        // Save the problematic files for inspection
        const diffDir = path.join(testDir, 'diff-large');
        if (!fs.existsSync(diffDir)) {
          fs.mkdirSync(diffDir, { recursive: true });
        }
        fs.writeFileSync(path.join(diffDir, 'expected.txt'), expectedOutput);
        fs.writeFileSync(path.join(diffDir, 'actual.txt'), actualOutput);
        console.log(`Diff files saved in ${diffDir} for inspection`);
      }

      expect(actualOutput).toBe(expectedOutput);
    } finally {
      // Clean up streams to prevent memory leaks
      if (!inputStream.destroyed) inputStream.destroy();
      if (!outputStream.destroyed) outputStream.destroy();
    }
  }, 30000); // Longer timeout for large file

  test('should process commands via CLI stdin from a file', async () => {
    // Generate test data files (small size for the CLI test) with a fixed seed
    const { inputPath, outputPath } = generateTestDataFiles(
      0.05, // Use a smaller file (0.05 MB) for the CLI test for faster execution
      inputFilePath,
      outputFilePath,
      54321 // Different fixed seed for this test
    );

    expect(fs.existsSync(inputPath)).toBeTruthy();
    expect(fs.existsSync(outputPath)).toBeTruthy();

    // Get expected output
    const expectedOutput = fs.readFileSync(outputPath, 'utf8').trim();

    try {
      // Execute the CLI with the input file streamed via stdin
      // Using "cat" to read the file and pipe it to the CLI process
      const { stdout, stderr } = await execAsync(
        `cat ${inputPath} | npm run -s dev`,
        { timeout: 10000 } // 10 second timeout
      );

      // Trim the output to remove any leading/trailing whitespace
      const actualOutput = stdout.trim();

      // Log any stderr output for debugging
      if (stderr) {
        console.log('stderr output:', stderr);
      }

      // If they don't match, log detailed diagnostics before the assertion fails
      if (actualOutput !== expectedOutput) {
        const actualLines = actualOutput.split('\n');
        const expectedLines = expectedOutput.split('\n');

        console.log(`Expected lines: ${expectedLines.length}, Actual lines: ${actualLines.length}`);

        // Find first difference
        for (let i = 0; i < Math.max(expectedLines.length, actualLines.length); i++) {
          if (expectedLines[i] !== actualLines[i]) {
            console.log(`First difference at line ${i + 1}:`);
            console.log(`Expected: "${expectedLines[i] || 'undefined'}" `);
            console.log(`Actual  : "${actualLines[i] || 'undefined'}" `);
            break;
          }
        }

        // Save the problematic files for inspection
        const diffDir = path.join(testDir, 'diff-cli');
        if (!fs.existsSync(diffDir)) {
          fs.mkdirSync(diffDir, { recursive: true });
        }
        fs.writeFileSync(path.join(diffDir, 'expected.txt'), expectedOutput);
        fs.writeFileSync(path.join(diffDir, 'actual.txt'), actualOutput);
        console.log(`Diff files saved in ${diffDir} for inspection`);
      }

      expect(actualOutput).toBe(expectedOutput);
    } catch (error) {
      // If the CLI process fails, provide detailed error information
      console.error('CLI process error:', error);
      throw error;
    }
  }, 15000); // Longer timeout to allow for CLI execution
});
