import fs from 'fs';
import path from 'path';
import { Writable, Readable } from 'node:stream';
import { robotEngine } from '../src/core/robotEngine';
import {
  moveInCircle,
  moveBackAndForthInCardinalDirections,
  stayInCenterMultipleReports,
} from './generateTestData';

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

describe('Robot Simulator', () => {
  test('should process commands from test1.txt correctly', async () => {
    // Get expected output
    const expectedOutput = fs
      .readFileSync(path.join(__dirname, 'expected/test1.txt'), 'utf8')
      .trim();

    // Create streams
    const inputStream = fs.createReadStream(path.join(__dirname, 'input/test1.txt'), {
      encoding: 'utf8',
    });
    const outputStream = new MockWritableStream();

    try {
      // Process the input and wait for completion
      await robotEngine(inputStream, outputStream);

      // Check the output
      expect(outputStream.getWrittenContent()).toBe(expectedOutput);
    } finally {
      // Clean up streams to prevent memory leaks
      if (!inputStream.destroyed) inputStream.destroy();
      if (!outputStream.destroyed) outputStream.destroy();
    }
  }, 5000);

  test('should process commands from test2.txt correctly', async () => {
    // Get expected output
    const expectedOutput = fs
      .readFileSync(path.join(__dirname, 'expected/test2.txt'), 'utf8')
      .trim();

    // Create streams
    const inputStream = fs.createReadStream(path.join(__dirname, 'input/test2.txt'), {
      encoding: 'utf8',
    });
    const outputStream = new MockWritableStream();

    try {
      // Process the input and wait for completion
      await robotEngine(inputStream, outputStream);

      // Check the output
      expect(outputStream.getWrittenContent()).toBe(expectedOutput);
    } finally {
      // Clean up streams to prevent memory leaks
      if (!inputStream.destroyed) inputStream.destroy();
      if (!outputStream.destroyed) outputStream.destroy();
    }
  }, 5000);

  test('should process commands from test3.txt correctly', async () => {
    // Get expected output
    const expectedOutput = fs
      .readFileSync(path.join(__dirname, 'expected/test3.txt'), 'utf8')
      .trim();

    // Create streams
    const inputStream = fs.createReadStream(path.join(__dirname, 'input/test3.txt'), {
      encoding: 'utf8',
    });
    const outputStream = new MockWritableStream();

    try {
      // Process the input and wait for completion
      await robotEngine(inputStream, outputStream);

      expect(outputStream.getWrittenContent()).toBe(expectedOutput);
    } finally {
      // Clean up streams to prevent memory leaks
      if (!inputStream.destroyed) inputStream.destroy();
      if (!outputStream.destroyed) outputStream.destroy();
    }
  }, 5000);

  test('should process a large sequence of commands correctly', async () => {
    // Instead of using the complex generator function, we'll create our own test data
    // by repeating the known-good individual test cases
    const testCases = [
      moveInCircle,
      moveBackAndForthInCardinalDirections,
      stayInCenterMultipleReports,
    ];

    // Combine all test cases into one long sequence
    const allInputs: string[] = [];
    const allExpectedOutputs: string[] = [];

    // Repeat the test cases to create about 1MB of test data
    for (let i = 0; i < 800; i++) {
      const testCase = testCases[i % testCases.length];
      allInputs.push(...testCase.inputs);
      allExpectedOutputs.push(...testCase.expectedOutput);
    }

    const inputContent = allInputs.join('\n');
    const inputStream = Readable.from([inputContent]);
    const outputStream = new MockWritableStream();

    try {
      // Process the input
      await robotEngine(inputStream, outputStream);

      // Get actual output and expected output
      const actualOutput = outputStream.getWrittenContent();
      const expectedOutput = allExpectedOutputs.join('\n');

      expect(actualOutput).toBe(expectedOutput);
    } finally {
      // Clean up
      if (!inputStream.destroyed) inputStream.destroy();
      if (!outputStream.destroyed) outputStream.destroy();
    }
  }, 10000); // Longer timeout for large file
});
