#!/usr/bin/env node
import Stream from 'node:stream';
import { commandParser } from './lib/commandParser.js';

export type TurnInstruction = 'LEFT' | 'RIGHT';
export type InstructionTerm = 'PLACE' | 'MOVE' | 'REPORT' | TurnInstruction;

export type Direction = 'NORTH' | 'EAST' | 'SOUTH' | 'WEST';

export type Positioned = {
  status: 'POSITIONED';
  x: number;
  y: number;
  facing: Direction;
  canvas: Canvas;
};
export type NotPositioned = {
  status: 'NOT_POSITIONED';
  x: null;
  y: null;
  facing: null;
  canvas: Canvas;
};

export type RobotState = Positioned | NotPositioned;

export type PlaceInstruction = { type: 'PLACE'; x: number; y: number; facing: Direction };
export type SimpleInstruction =
  | { type: 'MOVE' }
  | { type: 'LEFT' }
  | { type: 'RIGHT' }
  | { type: 'REPORT' };

export type Instruction = PlaceInstruction | SimpleInstruction;

export type CommandParser = (lines: string) => Instruction[];
export type InputHandler = (input: Stream.Readable, output: Stream.Writable) => void;

export type Canvas = {
  w: number;
  h: number;
};

export const MOVE_AMOUNT = 1;

export const handleInput: InputHandler = (
  input: Stream.Readable,
  output: Stream.Writable
): void => {
  const chunks: string[] = [];

  input.on('readable', () => {
    while (true) {
      const chunk: unknown = input.read();
      console.log('🔥 Read chunk', chunk);
      if (chunk === null || typeof chunk !== 'string') {
        break;
      }
      chunks.push(chunk);
    }
  });

  input.on('end', () => {
    const inputString = chunks.join('');
    const instructions = commandParser(inputString);

    output.write(instructions);
    output.end();
  });
};

const main = () => {};

export { main };
