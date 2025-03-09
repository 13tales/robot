#!/usr/bin/env node
import Stream, { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { commandParser } from './lib/commandParser.js';
import { isPositioned, robotReducer } from './lib/robot.js';

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
export type ReportInstruction = { type: 'REPORT' };
export type SimpleInstruction = { type: 'MOVE' } | { type: 'LEFT' } | { type: 'RIGHT' };
export type Instruction = PlaceInstruction | SimpleInstruction | ReportInstruction;

export const isPlaceInstruction = (v: unknown): v is PlaceInstruction => {
  if (typeof v !== 'object') {
    return false;
  }

  const asPlace = v as PlaceInstruction;

  return (
    asPlace.type === 'PLACE' &&
    typeof asPlace.facing === 'string' &&
    typeof asPlace.x === 'number' &&
    typeof asPlace.y === 'number'
  );
};

export const isSimpleInstruction = (v: unknown): v is SimpleInstruction => {
  if (typeof v !== 'object') {
    return false;
  }

  const asSimple = v as SimpleInstruction;
  return asSimple.type === 'MOVE' || asSimple.type === 'LEFT' || asSimple.type === 'RIGHT';
};

export const isReportInstruction = (v: unknown): v is ReportInstruction => {
  if (typeof v !== 'object') {
    return false;
  }

  const asReport = v as ReportInstruction;
  return asReport.type === 'REPORT';
};

export const isInstruction = (v: unknown): v is Instruction =>
  isSimpleInstruction(v) || isPlaceInstruction(v) || isReportInstruction(v);

export type CommandParser = (lines: string) => Instruction[];
export type InputHandler = (input: Stream.Readable, output: Stream.Writable) => Promise<void>;

export type Canvas = {
  w: number;
  h: number;
};

export const MOVE_AMOUNT = 1;

export type RobotReducer = (state: RobotState, action: Instruction) => RobotState;

const outputFormatter = (state: RobotState): string | null => {
  if (!isPositioned(state)) {
    return null;
  } else {
    const { x, y, facing } = state;
    return `${x},${y},${facing}`;
  }
};

export class StateReducerTransform extends Transform {
  private state: RobotState;
  private reducer: RobotReducer;

  constructor(reducer: RobotReducer, initialState: RobotState) {
    super({
      objectMode: true,
    });

    this.reducer = reducer;
    this.state = initialState;
  }

  _transform(chunk: unknown, _encoding: BufferEncoding, callback: Stream.TransformCallback): void {
    try {
      if (isSimpleInstruction(chunk) || isPlaceInstruction(chunk)) {
        const newState = this.reducer(this.state, chunk);
        this.state = newState;
        callback();
      } else if (isReportInstruction(chunk)) {
        const formattedOutput = outputFormatter(this.state);
        if (formattedOutput !== null) {
          this.push(formattedOutput);
        }
        callback();
      } else {
        callback();
      }
    } catch (err) {
      if (err instanceof Error) {
        callback(err);
      } else {
        callback();
      }
    }
  }

  _flush(callback: Stream.TransformCallback): void {
    callback();
  }
}

export const handleInput: InputHandler = async (
  input: Stream.Readable,
  output: Stream.Writable
): Promise<void> => {
  const reducerTransform = new StateReducerTransform(robotReducer, {
    status: 'NOT_POSITIONED',
    x: null,
    y: null,
    facing: null,
    canvas: { h: 5, w: 5 },
  });

  const commandParseTransform = new Transform({
    objectMode: true,
    transform(chunk, _encoding, callback) {
      if (typeof chunk === 'string') {
        const commands = commandParser(chunk);
        commands.forEach(cmd => this.push(cmd));
        callback();
      } else {
        // Ignore anything that's not a string
        callback();
      }
    },
    flush(callback) {
      callback();
    },
  });

  try {
    await pipeline(input, commandParseTransform, reducerTransform, output);
  } catch (err) {
    console.error('Pipeline failed', err);
    throw err;
  } finally {
    // Ensure streams are properly cleaned up
    if (!input.destroyed) input.destroy();
    if (!output.destroyed) output.destroy();
  }
};

const main = () => {};

export { main };
