#!/usr/bin/env node

import { main } from './main';

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
