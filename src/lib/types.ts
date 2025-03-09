import Stream from 'node:stream';

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

export type CommandParser = (lines: string) => Instruction[];
export type InputHandler = (input: Stream.Readable, output: Stream.Writable) => Promise<void>;

export type Canvas = {
  w: number;
  h: number;
};
