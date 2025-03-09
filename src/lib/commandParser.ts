import { Instruction, SimpleInstruction, CommandParser, Direction } from './types.js';

const COMMAND_REGEX =
  /(?<term>MOVE|LEFT|RIGHT|REPORT|PLACE)\s*((?<x>\d),\s*(?<y>\d),\s*(?<facing>NORTH|SOUTH|EAST|WEST)\b)?/i;

export const parseInstruction = (instruction: string): Instruction | null => {
  const result = COMMAND_REGEX.exec(instruction);

  if (!result?.groups) {
    return null;
  }

  const { term, x, y, facing } = result.groups;

  if (!term) {
    return null;
  }

  if (term === 'PLACE') {
    if (typeof x !== 'string' || typeof y !== 'string' || typeof facing !== 'string') {
      return null;
    }

    const xInt = parseInt(x);
    const yInt = parseInt(y);

    if (isNaN(xInt) || isNaN(yInt)) {
      return null;
    }

    // Allowing the type assertions here because the regex should have already validated
    // things somewhat.
    return { type: 'PLACE', x: xInt, y: yInt, facing: facing as Direction };
  } else {
    return { type: term } as SimpleInstruction;
  }
};

// Parse a chunk of text into a list of instructions
export const commandParser: CommandParser = (line: string, delimiter: string = '\n') => {
  const instructions = line.trim().toUpperCase().split(delimiter);

  const parsedInstructions = instructions.map((instruction: string) => {
    const parsedInstruction = parseInstruction(instruction);

    return parsedInstruction;
  });

  return parsedInstructions.filter(
    (instruction): instruction is Instruction => instruction !== null
  );
};
