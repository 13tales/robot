import { handleInput } from '../src/main.js';
import fs from 'fs';
import path from 'path';
import { Writable } from 'node:stream';

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
  test('should process commands from test1.txt correctly', () => {
    // Get expected output
    const expectedOutput = fs
      .readFileSync(path.join(__dirname, 'expected/test1.txt'), 'utf8')
      .trim();

    // Create streams
    const inputStream = fs.createReadStream(path.join(__dirname, 'input/test1.txt'), {
      encoding: 'utf8',
    });
    const outputStream = new MockWritableStream();

    // Await the handleInput function to complete
    handleInput(inputStream, outputStream);

    // Check the output after processing is complete
    expect(outputStream.getWrittenContent()).toBe(expectedOutput);
  });

  test('should process commands from test2.txt correctly', () => {
    // Get expected output
    const expectedOutput = fs
      .readFileSync(path.join(__dirname, 'expected/test2.txt'), 'utf8')
      .trim();

    // Create streams
    const inputStream = fs.createReadStream(path.join(__dirname, 'input/test2.txt'), {
      encoding: 'utf8',
    });
    const outputStream = new MockWritableStream();

    // Await the handleInput function to complete
    handleInput(inputStream, outputStream);

    // Check the output after processing is complete
    expect(outputStream.getWrittenContent()).toBe(expectedOutput);
  });

  test('should process commands from test3.txt correctly', () => {
    // Get expected output
    const expectedOutput = fs
      .readFileSync(path.join(__dirname, 'expected/test3.txt'), 'utf8')
      .trim();

    // Create streams
    const inputStream = fs.createReadStream(path.join(__dirname, 'input/test3.txt'), {
      encoding: 'utf8',
    });
    const outputStream = new MockWritableStream();

    // Await the handleInput function to complete
    handleInput(inputStream, outputStream);

    // Check the output after processing is complete
    expect(outputStream.getWrittenContent()).toBe(expectedOutput);
  });
});
