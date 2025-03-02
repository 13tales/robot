#!/usr/bin/env node

import Stream from 'node:stream';

export const handleInput = async (
  input: Stream.Readable,
  output: Stream.Writable
): Promise<void> => {
  const instructions = await input.reduce((acc, instruction) => {
    return acc + instruction;
  }, '');

  output.write(instructions);
  output.end();
};

const main = () => {};

export { main };
