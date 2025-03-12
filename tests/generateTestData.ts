/* Simple type for movement test data;
 * an object containing an array of inputs and an array of expected outputs.
 */
type MovementTestData = { inputs: string[]; expectedOutput: string[] };

export const moveInCircle: MovementTestData = {
  inputs: ['PLACE 0,0,NORTH', 'MOVE', 'RIGHT', 'MOVE', 'RIGHT', 'MOVE', 'RIGHT', 'MOVE', 'REPORT'],
  expectedOutput: ['0,0,WEST'],
};

export const moveBackAndForthInCardinalDirections: MovementTestData = {
  inputs: [
    'PLACE 2,2,NORTH',
    'MOVE',
    'MOVE',
    'LEFT',
    'LEFT',
    'MOVE',
    'MOVE',
    'RIGHT',
    'MOVE',
    'MOVE',
    'LEFT',
    'LEFT',
    'MOVE',
    'MOVE',
    'RIGHT',
    'MOVE',
    'MOVE',
    'LEFT',
    'LEFT',
    'MOVE',
    'MOVE',
    'RIGHT',
    'MOVE',
    'MOVE',
    'LEFT',
    'LEFT',
    'MOVE',
    'MOVE',
    'REPORT',
  ],
  expectedOutput: ['2,2,WEST'],
};

export const stayInCenterMultipleReports: MovementTestData = {
  inputs: [
    'PLACE 2,2,NORTH',
    'REPORT',
    'RIGHT',
    'REPORT',
    'RIGHT',
    'REPORT',
    'RIGHT',
    'REPORT',
    'RIGHT',
    'REPORT',
  ],
  expectedOutput: ['2,2,NORTH', '2,2,EAST', '2,2,SOUTH', '2,2,WEST', '2,2,NORTH'],
};

import fs from 'fs';
import path from 'path';

/**
 * Generates test data files by randomly selecting from test data objects
 * until the input file reaches the specified size threshold.
 *
 * @param sizeThresholdMB - The minimum size in megabytes for the input file
 * @param inputFilePath - Optional custom path for the input file
 * @param outputFilePath - Optional custom path for the output file
 * @param seed - Optional seed for deterministic randomness (makes tests more reproducible)
 * @returns An object containing the paths to the generated input and output files
 */
export function generateTestDataFiles(
  sizeThresholdMB: number,
  inputFilePath = path.join(__dirname, 'testData.input.txt'),
  outputFilePath = path.join(__dirname, 'testData.output.txt'),
  seed?: number
): { inputPath: string; outputPath: string } {
  // Convert MB to bytes
  const sizeThresholdBytes = sizeThresholdMB * 1024 * 1024;

  // Collect all test data objects from this file
  const testDataObjects: MovementTestData[] = [
    moveInCircle,
    moveBackAndForthInCardinalDirections,
    stayInCenterMultipleReports,
  ];

  // Initialize files
  fs.writeFileSync(inputFilePath, '');
  fs.writeFileSync(outputFilePath, '');

  let currentInputSize = 0;

  // Create a simple deterministic random number generator if seed is provided
  let seedValue = seed || Math.floor(Math.random() * 1000000);
  console.log(`Using random seed: ${seedValue}`);

  const nextRandom = () => {
    // Simple LCG random generator
    seedValue = (seedValue * 1664525 + 1013904223) % 2147483648;
    return seedValue / 2147483648;
  };

  // Keep adding data until we reach the size threshold
  while (currentInputSize < sizeThresholdBytes) {
    // Randomly select a test data object using either seeded or Math.random
    const randomValue = seed ? nextRandom() : Math.random();
    const randomIndex = Math.floor(randomValue * testDataObjects.length);
    const testData = testDataObjects[randomIndex];

    // Get the first input which should be a PLACE command
    const firstCommand = testData.inputs[0];

    // Always make sure we start with a PLACE command to reset the robot state
    if (firstCommand.startsWith('PLACE')) {
      // Append inputs to input file
      const inputContent = testData.inputs.join('\n') + '\n';
      fs.appendFileSync(inputFilePath, inputContent);

      // Append expected outputs to output file
      const outputContent = testData.expectedOutput.join('\n') + '\n';
      fs.appendFileSync(outputFilePath, outputContent);
    } else {
      console.warn(`Warning: Test pattern doesn't start with a PLACE command: ${firstCommand}`);
    }

    // Update current size
    currentInputSize = fs.statSync(inputFilePath).size;
  }

  console.log(`Generated test data files:
    - Input file: ${inputFilePath} (${(currentInputSize / 1024 / 1024).toFixed(2)} MB)
    - Output file: ${outputFilePath}`);

  return {
    inputPath: inputFilePath,
    outputPath: outputFilePath,
  };
}

if (require.main === module) {
  const size = Number.parseInt(process.argv[2]) ?? 1;
  console.log(`Writing test data: ${size}mb`);

  if (Number.isNaN(size)) {
    throw new Error('Argument must be an integer');
  }

  const start = performance.now();
  generateTestDataFiles(size);
  const finish = performance.now();

  console.log(`Finished in ${((finish - start) / 1000).toFixed(2)}s`);
}
