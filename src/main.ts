#!/usr/bin/env node
import Stream from 'node:stream';

export type InstructionTerm = 'PLACE' | 'MOVE' | 'LEFT' | 'RIGHT' | 'REPORT';

export type Direction = 'NORTH' | 'EAST' | 'SOUTH' | 'WEST';

export type RobotState = {
  x: number;
  y: number;
  facing: Direction;
};

export type PlaceInstruction = { type: 'PLACE'; x: number; y: number; facing: Direction };
export type SimpleInstruction =
  | { type: 'MOVE' }
  | { type: 'LEFT' }
  | { type: 'RIGHT' }
  | { type: 'REPORT' };

export type Instruction = PlaceInstruction | SimpleInstruction;

export type CommandParser = (line: string, canvas: Canvas) => Instruction[];
export type InputHandler = (input: Stream.Readable, output: Stream.Writable) => Promise<void>;

export type Canvas = {
  w: number;
  h: number;
};

export const handleInput: InputHandler = async (
  input: Stream.Readable,
  output: Stream.Writable,
  canvas = { w: 5, h: 5 }
): Promise<void> => {
  output.write(instructions);
  output.end();
};

const main = () => {};

export { main };
