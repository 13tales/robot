import { robotReducer } from '../src/lib/robot';
import { Canvas, RobotState, Instruction } from '../src/lib/types';

const defaultCanvas: Canvas = { w: 5, h: 5 };

describe('robotReducer', () => {
  describe('PLACE instruction', () => {
    it('should change state to POSITIONED when receiving valid PLACE instruction while not positioned', () => {
      // Initial state: not positioned
      const initialState: RobotState = {
        status: 'NOT_POSITIONED',
        x: null,
        y: null,
        facing: null,
        canvas: defaultCanvas,
      };

      // Valid PLACE instruction
      const instruction: Instruction = {
        type: 'PLACE',
        x: 2,
        y: 3,
        facing: 'NORTH',
      };

      // Apply the instruction
      const newState = robotReducer(initialState, instruction);

      // Check the result
      expect(newState).toEqual({
        status: 'POSITIONED',
        x: 2,
        y: 3,
        facing: 'NORTH',
        canvas: defaultCanvas,
      });
    });

    it('should update position and facing when receiving valid PLACE instruction while already positioned', () => {
      // Initial state: already positioned
      const initialState: RobotState = {
        status: 'POSITIONED',
        x: 0,
        y: 0,
        facing: 'EAST',
        canvas: defaultCanvas,
      };

      // Valid PLACE instruction
      const instruction: Instruction = {
        type: 'PLACE',
        x: 4,
        y: 2,
        facing: 'WEST',
      };

      // Apply the instruction
      const newState = robotReducer(initialState, instruction);

      // Check the result
      expect(newState).toEqual({
        status: 'POSITIONED',
        x: 4,
        y: 2,
        facing: 'WEST',
        canvas: defaultCanvas,
      });
    });

    it('should not change state when receiving invalid PLACE instruction while not positioned', () => {
      // Initial state: not positioned
      const initialState: RobotState = {
        status: 'NOT_POSITIONED',
        x: null,
        y: null,
        facing: null,
        canvas: defaultCanvas,
      };

      // Invalid PLACE instruction (outside canvas)
      const instruction: Instruction = {
        type: 'PLACE',
        x: 6, // Outside the 5x5 canvas
        y: 3,
        facing: 'NORTH',
      };

      // Apply the instruction
      const newState = robotReducer(initialState, instruction);

      // Check that state didn't change
      expect(newState).toEqual(initialState);
    });

    it('should not change state when receiving invalid PLACE instruction while positioned', () => {
      // Initial state: already positioned
      const initialState: RobotState = {
        status: 'POSITIONED',
        x: 2,
        y: 2,
        facing: 'SOUTH',
        canvas: defaultCanvas,
      };

      // Invalid PLACE instruction (outside canvas)
      const instruction: Instruction = {
        type: 'PLACE',
        x: 2,
        y: -1, // Negative coordinates are invalid
        facing: 'EAST',
      };

      // Apply the instruction
      const newState = robotReducer(initialState, instruction);

      // Check that state didn't change
      expect(newState).toEqual(initialState);
    });
  });

  describe('MOVE instruction', () => {
    it('should ignore MOVE command when robot is not positioned', () => {
      // Initial state: not positioned
      const initialState: RobotState = {
        status: 'NOT_POSITIONED',
        x: null,
        y: null,
        facing: null,
        canvas: defaultCanvas,
      };

      // MOVE instruction
      const instruction: Instruction = { type: 'MOVE' };

      // Apply the instruction
      const newState = robotReducer(initialState, instruction);

      // Check that state didn't change
      expect(newState).toEqual(initialState);
    });

    it('should increment y coordinate by 1 when facing NORTH', () => {
      // Initial state: positioned facing NORTH
      const initialState: RobotState = {
        status: 'POSITIONED',
        x: 2,
        y: 2,
        facing: 'NORTH',
        canvas: defaultCanvas,
      };

      // MOVE instruction
      const instruction: Instruction = { type: 'MOVE' };

      // Apply the instruction
      const newState = robotReducer(initialState, instruction);

      // Check the result
      expect(newState).toEqual({
        status: 'POSITIONED',
        x: 2,
        y: 3, // y increased by 1
        facing: 'NORTH',
        canvas: defaultCanvas,
      });
    });

    it('should increment x coordinate by 1 when facing EAST', () => {
      // Initial state: positioned facing EAST
      const initialState: RobotState = {
        status: 'POSITIONED',
        x: 2,
        y: 2,
        facing: 'EAST',
        canvas: defaultCanvas,
      };

      // MOVE instruction
      const instruction: Instruction = { type: 'MOVE' };

      // Apply the instruction
      const newState = robotReducer(initialState, instruction);

      // Check the result
      expect(newState).toEqual({
        status: 'POSITIONED',
        x: 3, // x increased by 1
        y: 2,
        facing: 'EAST',
        canvas: defaultCanvas,
      });
    });

    it('should decrement y coordinate by 1 when facing SOUTH', () => {
      // Initial state: positioned facing SOUTH
      const initialState: RobotState = {
        status: 'POSITIONED',
        x: 2,
        y: 2,
        facing: 'SOUTH',
        canvas: defaultCanvas,
      };

      // MOVE instruction
      const instruction: Instruction = { type: 'MOVE' };

      // Apply the instruction
      const newState = robotReducer(initialState, instruction);

      // Check the result
      expect(newState).toEqual({
        status: 'POSITIONED',
        x: 2,
        y: 1, // y decreased by 1
        facing: 'SOUTH',
        canvas: defaultCanvas,
      });
    });

    it('should decrement x coordinate by 1 when facing WEST', () => {
      // Initial state: positioned facing WEST
      const initialState: RobotState = {
        status: 'POSITIONED',
        x: 2,
        y: 2,
        facing: 'WEST',
        canvas: defaultCanvas,
      };

      // MOVE instruction
      const instruction: Instruction = { type: 'MOVE' };

      // Apply the instruction
      const newState = robotReducer(initialState, instruction);

      // Check the result
      expect(newState).toEqual({
        status: 'POSITIONED',
        x: 1, // x decreased by 1
        y: 2,
        facing: 'WEST',
        canvas: defaultCanvas,
      });
    });

    it('should not change state when movement would take robot outside northern boundary', () => {
      // Initial state: positioned at the north edge
      const initialState: RobotState = {
        status: 'POSITIONED',
        x: 2,
        y: 4, // Already at the northern edge (canvas height is 5)
        facing: 'NORTH',
        canvas: defaultCanvas,
      };

      // MOVE instruction
      const instruction: Instruction = { type: 'MOVE' };

      // Apply the instruction
      const newState = robotReducer(initialState, instruction);

      // Check that state didn't change
      expect(newState).toEqual(initialState);
    });

    it('should not change state when movement would take robot outside eastern boundary', () => {
      // Initial state: positioned at the east edge
      const initialState: RobotState = {
        status: 'POSITIONED',
        x: 4, // Already at the eastern edge (canvas width is 5)
        y: 2,
        facing: 'EAST',
        canvas: defaultCanvas,
      };

      // MOVE instruction
      const instruction: Instruction = { type: 'MOVE' };

      // Apply the instruction
      const newState = robotReducer(initialState, instruction);

      // Check that state didn't change
      expect(newState).toEqual(initialState);
    });

    it('should not change state when movement would take robot outside southern boundary', () => {
      // Initial state: positioned at the south edge
      const initialState: RobotState = {
        status: 'POSITIONED',
        x: 2,
        y: 0, // Already at the southern edge (y=0)
        facing: 'SOUTH',
        canvas: defaultCanvas,
      };

      // MOVE instruction
      const instruction: Instruction = { type: 'MOVE' };

      // Apply the instruction
      const newState = robotReducer(initialState, instruction);

      // Check that state didn't change
      expect(newState).toEqual(initialState);
    });

    it('should not change state when movement would take robot outside western boundary', () => {
      // Initial state: positioned at the west edge
      const initialState: RobotState = {
        status: 'POSITIONED',
        x: 0, // Already at the western edge (x=0)
        y: 2,
        facing: 'WEST',
        canvas: defaultCanvas,
      };

      // MOVE instruction
      const instruction: Instruction = { type: 'MOVE' };

      // Apply the instruction
      const newState = robotReducer(initialState, instruction);

      // Check that state didn't change
      expect(newState).toEqual(initialState);
    });
  });
});

describe('Turn instructions', () => {
  describe('LEFT turns', () => {
    it('should turn from NORTH to WEST when instructed to turn LEFT', () => {
      // Initial state: positioned facing NORTH
      const initialState: RobotState = {
        status: 'POSITIONED',
        x: 2,
        y: 2,
        facing: 'NORTH',
        canvas: defaultCanvas,
      };

      // LEFT instruction
      const instruction: Instruction = { type: 'LEFT' };

      // Apply the instruction
      const newState = robotReducer(initialState, instruction);

      // Check that facing direction has changed to WEST
      expect(newState).toEqual({
        ...initialState,
        facing: 'WEST',
      });
    });

    it('should turn from WEST to SOUTH when instructed to turn LEFT', () => {
      // Initial state: positioned facing WEST
      const initialState: RobotState = {
        status: 'POSITIONED',
        x: 2,
        y: 2,
        facing: 'WEST',
        canvas: defaultCanvas,
      };

      // LEFT instruction
      const instruction: Instruction = { type: 'LEFT' };

      // Apply the instruction
      const newState = robotReducer(initialState, instruction);

      // Check that facing direction has changed to SOUTH
      expect(newState).toEqual({
        ...initialState,
        facing: 'SOUTH',
      });
    });

    it('should turn from SOUTH to EAST when instructed to turn LEFT', () => {
      // Initial state: positioned facing SOUTH
      const initialState: RobotState = {
        status: 'POSITIONED',
        x: 2,
        y: 2,
        facing: 'SOUTH',
        canvas: defaultCanvas,
      };

      // LEFT instruction
      const instruction: Instruction = { type: 'LEFT' };

      // Apply the instruction
      const newState = robotReducer(initialState, instruction);

      // Check that facing direction has changed to EAST
      expect(newState).toEqual({
        ...initialState,
        facing: 'EAST',
      });
    });

    it('should turn from EAST to NORTH when instructed to turn LEFT', () => {
      // Initial state: positioned facing EAST
      const initialState: RobotState = {
        status: 'POSITIONED',
        x: 2,
        y: 2,
        facing: 'EAST',
        canvas: defaultCanvas,
      };

      // LEFT instruction
      const instruction: Instruction = { type: 'LEFT' };

      // Apply the instruction
      const newState = robotReducer(initialState, instruction);

      // Check that facing direction has changed to NORTH
      expect(newState).toEqual({
        ...initialState,
        facing: 'NORTH',
      });
    });
  });

  describe('RIGHT turns', () => {
    it('should turn from NORTH to EAST when instructed to turn RIGHT', () => {
      // Initial state: positioned facing NORTH
      const initialState: RobotState = {
        status: 'POSITIONED',
        x: 2,
        y: 2,
        facing: 'NORTH',
        canvas: defaultCanvas,
      };

      // RIGHT instruction
      const instruction: Instruction = { type: 'RIGHT' };

      // Apply the instruction
      const newState = robotReducer(initialState, instruction);

      // Check that facing direction has changed to EAST
      expect(newState).toEqual({
        ...initialState,
        facing: 'EAST',
      });
    });

    it('should turn from EAST to SOUTH when instructed to turn RIGHT', () => {
      // Initial state: positioned facing EAST
      const initialState: RobotState = {
        status: 'POSITIONED',
        x: 2,
        y: 2,
        facing: 'EAST',
        canvas: defaultCanvas,
      };

      // RIGHT instruction
      const instruction: Instruction = { type: 'RIGHT' };

      // Apply the instruction
      const newState = robotReducer(initialState, instruction);

      // Check that facing direction has changed to SOUTH
      expect(newState).toEqual({
        ...initialState,
        facing: 'SOUTH',
      });
    });

    it('should turn from SOUTH to WEST when instructed to turn RIGHT', () => {
      // Initial state: positioned facing SOUTH
      const initialState: RobotState = {
        status: 'POSITIONED',
        x: 2,
        y: 2,
        facing: 'SOUTH',
        canvas: defaultCanvas,
      };

      // RIGHT instruction
      const instruction: Instruction = { type: 'RIGHT' };

      // Apply the instruction
      const newState = robotReducer(initialState, instruction);

      // Check that facing direction has changed to WEST
      expect(newState).toEqual({
        ...initialState,
        facing: 'WEST',
      });
    });

    it('should turn from WEST to NORTH when instructed to turn RIGHT', () => {
      // Initial state: positioned facing WEST
      const initialState: RobotState = {
        status: 'POSITIONED',
        x: 2,
        y: 2,
        facing: 'WEST',
        canvas: defaultCanvas,
      };

      // RIGHT instruction
      const instruction: Instruction = { type: 'RIGHT' };

      // Apply the instruction
      const newState = robotReducer(initialState, instruction);

      // Check that facing direction has changed to NORTH
      expect(newState).toEqual({
        ...initialState,
        facing: 'NORTH',
      });
    });
  });

  it('should not change state when robot is not positioned', () => {
    // Initial state: not positioned
    const initialState: RobotState = {
      status: 'NOT_POSITIONED',
      x: null,
      y: null,
      facing: null,
      canvas: defaultCanvas,
    };

    // LEFT instruction (same would apply for RIGHT)
    const instruction: Instruction = { type: 'LEFT' };

    // Apply the instruction
    const newState = robotReducer(initialState, instruction);

    // Check that state didn't change
    expect(newState).toEqual(initialState);
  });
});
