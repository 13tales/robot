#!/usr/bin/env node

import Stream from 'node:stream';
import { program } from 'commander';
import { createReadStream } from 'node:fs';
import { handleInput } from './core/robotEngine';

export const MOVE_AMOUNT = 1;

export const main = async () => {
  program
    .name('bot-sim')
    .description('Toy robot programming exercise.')
    .argument(
      '[file]',
      'Optional file containing commands. Will receive commands from STDIN if no file is provided.'
    )
    .action(async filePath => {
      let input: Stream.Readable;

      if (typeof filePath === 'string') {
        try {
          input = createReadStream(filePath);
        } catch (err) {
          console.error(
            err instanceof Error ? `Error opening file ${filePath}: ${err}` : 'Unknown error.'
          );
          process.exit(1);
        }
      } else {
        // Stream input from STDIN if no file path was provided
        input = process.stdin;
      }

      try {
        await handleInput(input, process.stdout);
      } catch (err) {
        console.error(`Error: ${err instanceof Error ? err : 'Unknown error.'}`);
      }
    });

  process.on('SIGINT', () => {
    console.log('\nExiting.');
    process.exit();
  });

  await program.parseAsync();
};

if (require.main === module) {
  void (async () => {
    try {
      await main();
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  })();
}
