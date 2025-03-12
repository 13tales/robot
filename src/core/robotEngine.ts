import Stream, { Transform } from 'node:stream';
import { pipeline } from 'stream/promises';
import { commandParser } from '../lib/commandParser';
import { robotReducer } from '../lib/stateReducer';
import { InputHandler, RobotReducer, RobotState } from '../lib/types';
import { outputFormatter } from '../lib/outputFormatter';
import { isMoveInstruction, isPlaceInstruction, isReportInstruction } from '../lib/utils/utils';

export class StateReducerTransform extends Transform {
  private state: RobotState;
  private reducer: RobotReducer;

  constructor(reducer: RobotReducer, initialState: RobotState) {
    super({
      objectMode: true,
      highWaterMark: 64, // Lower high water mark to improve backpressure handling
    });

    this.reducer = reducer;
    this.state = { ...initialState };
  }

  _transform(chunk: unknown, _encoding: BufferEncoding, callback: Stream.TransformCallback): void {
    try {
      if (isPlaceInstruction(chunk) || isMoveInstruction(chunk)) {
        const newState = this.reducer(this.state, chunk);
        this.state = newState;
        callback();
      } else if (isReportInstruction(chunk)) {
        const formattedOutput = outputFormatter(this.state);
        if (formattedOutput !== null) {
          const pushResult = this.push(formattedOutput);
          // Handle backpressure if push returns false
          if (!pushResult) {
            setImmediate(callback);
            return;
          }
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

// Custom transform class to handle partial lines
class CommandParseTransform extends Transform {
  private partialLine: string = '';

  constructor() {
    super({
      objectMode: true,
      highWaterMark: 64, // Lower high water mark for better buffering control
    });
  }

  _transform(chunk: unknown, _encoding: BufferEncoding, callback: Stream.TransformCallback): void {
    // Make sure we have a string
    const data = typeof chunk === 'string' ? chunk : (chunk?.toString?.() ?? '');

    // Prepend any leftover partial line from the previous chunk
    const fullData = this.partialLine + data;

    const lines = fullData.split(/\r?\n/);

    // The last line might be incomplete if this chunk doesn't end with a newline
    // Save it for the next chunk
    this.partialLine = lines.pop() || '';

    // Process each complete line
    for (const line of lines) {
      if (line.trim() !== '') {
        try {
          const commands = commandParser(line.trim());

          // Use a loop with push results to handle backpressure
          for (const cmd of commands) {
            const pushResult = this.push(cmd);
            if (!pushResult) {
              // If we can't push anymore, break and wait for drain
              setImmediate(() => {
                for (let i = commands.indexOf(cmd); i < commands.length; i++) {
                  this.push(commands[i]);
                }
                callback();
              });
              return;
            }
          }
        } catch {
          // Just ignore invalid commands and continue processing
        }
      }
    }

    callback();
  }

  _flush(callback: Stream.TransformCallback): void {
    // Process any remaining partial line in the buffer
    if (this.partialLine && this.partialLine.trim() !== '') {
      try {
        const commands = commandParser(this.partialLine.trim());
        for (const cmd of commands) {
          this.push(cmd);
        }
      } catch {
        // Ignore invalid commands
      }
    }
    callback();
  }
}

export const robotEngine: InputHandler = async (
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

  const commandParseTransform = new CommandParseTransform();

  try {
    await pipeline(input, commandParseTransform, reducerTransform, output);
  } catch (err) {
    console.error('Pipeline failed', err);
    throw err;
  }
};
