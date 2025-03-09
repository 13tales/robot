import { RobotReducer } from '../main.js';
import Stream, { Transform } from 'stream';
import { pipeline } from 'stream/promises';
import { commandParser } from './commandParser.js';
import { robotReducer } from './robot.js';
import { InputHandler, RobotState } from './types.js';
import {
  isPositioned,
  isSimpleInstruction,
  isPlaceInstruction,
  isReportInstruction,
} from './utils.js';

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
    transform(chunk: unknown, _encoding, callback) {
      // Make sure we have a string
      const data = typeof chunk === 'string' ? chunk : (chunk?.toString?.().trim() ?? '');

      const commands = commandParser(data);
      commands.forEach(cmd => this.push(cmd));

      callback();
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
  }
};
