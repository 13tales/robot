import { Canvas, CommandParser, Direction, Instruction, InstructionTerm } from 'src/main.js';

const isDirection = (direction: string): direction is Direction => {
  return (
    direction === 'NORTH' || direction === 'EAST' || direction === 'SOUTH' || direction === 'WEST'
  );
};

const isValidTerm = (instruction: string): instruction is InstructionTerm => {
  return (
    instruction === 'PLACE' ||
    instruction === 'MOVE' ||
    instruction === 'LEFT' ||
    instruction === 'RIGHT' ||
    instruction === 'REPORT'
  );
};

// Consume a string and return a Place instruction if it is valid
const parsePlace = (
  instruction: string,
  canvas: Canvas
): { type: 'PLACE'; x: number; y: number; facing: Direction } | null => {
  const [term, x, y, facing] = instruction.split(' ');

  // Make sure all needed arguments are present
  if (term !== 'PLACE' || !x || !y || !facing) {
    return null;
  }

  const xInt = parseInt(x);
  const yInt = parseInt(y);

  // Check if the x and y are numbers
  if (isNaN(xInt) || isNaN(yInt)) {
    return null;
  }

  // Check if the place is within the canvas and the direction is valid
  if (xInt < 0 || xInt > canvas.w || yInt < 0 || yInt > canvas.h || !isDirection(facing)) {
    return null;
  }

  return { type: 'PLACE', x: xInt, y: yInt, facing };
};

// Parse a chunk of text into a list of instructions
export const commandParser: CommandParser = (
  line: string,
  canvas: Canvas,
  delimiter: string = '\n'
) => {
  const instructions = line.trim().toUpperCase().split(delimiter);

  const parsedInstructions = instructions.map((instruction: string) => {
    if (isValidTerm(instruction)) {
      return parsePlace(instruction, canvas) ?? { type: instruction };
    } else {
      return null;
    }
  });

  return parsedInstructions.filter(
    (instruction): instruction is Instruction => instruction !== null
  );
};
