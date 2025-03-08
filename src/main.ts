#!/usr/bin/env node
import Stream from 'node:stream';
import { commandParser } from './lib/commandParser.js';

export type InstructionTerm = 'PLACE' | 'MOVE' | 'LEFT' | 'RIGHT' | 'REPORT';

export type Direction = 'NORTH' | 'EAST' | 'SOUTH' | 'WEST';

export type RobotState =
  | {
      state: 'POSITIONED';
      x: number;
      y: number;
      facing: Direction;
      canvas: Canvas;
    }
  | {
      state: 'NOT_POSITIONED';
      x: null;
      y: null;
      facing: null;
      canvas: Canvas;
    };

export type PlaceInstruction = { type: 'PLACE'; x: number; y: number; facing: Direction };
export type SimpleInstruction =
  | { type: 'MOVE' }
  | { type: 'LEFT' }
  | { type: 'RIGHT' }
  | { type: 'REPORT' };

export type Instruction = PlaceInstruction | SimpleInstruction;

export type CommandParser = (line: string, canvas: Canvas) => Instruction[];
export type InputHandler = (input: Stream.Readable, output: Stream.Writable) => void;

export type Canvas = {
  w: number;
  h: number;
};

export const handleInput: InputHandler = (
  input: Stream.Readable,
  output: Stream.Writable,
  canvas = { w: 5, h: 5 }
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
    const instructions = commandParser(inputString, canvas);
    output.write(instructions);
    output.end();
  });
};

const main = () => {};

export { main };
