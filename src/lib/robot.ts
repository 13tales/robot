import {
  Instruction,
  MOVE_AMOUNT,
  RobotState,
  TurnInstruction,
  Direction,
  Positioned,
  NotPositioned,
  Canvas,
} from '../main.js';

// Using TS enums here for a concise reverse-mapping between strings and integer values
enum FACING_VALUE {
  NORTH = 0, // Explicit assignment for clarity
  EAST,
  SOUTH,
  WEST,
}

/* For clarity. As runtime objects, TS enums have double the entries we might expect,
    due to the reverse-mapping.
 */
const FACING_COUNT = 4;

enum TURN_VALUE {
  LEFT = -1,
  RIGHT = 1,
}

// Helper function to handle TURN instructions
export const getNewFacing = (turn: TurnInstruction, facing: Direction): Direction => {
  // Calculate each part of the facing value computation
  const currentFacingValue = FACING_VALUE[facing];
  const turnValue = TURN_VALUE[turn];
  const rawNewFacing = currentFacingValue + turnValue;
  // Workaround for the quirks of the JS modulo/remainder operator
  const newFacingValue = (rawNewFacing + FACING_COUNT) % FACING_COUNT;

  return FACING_VALUE[newFacingValue] as Direction;
};

export const isPositioned = (state: Positioned | NotPositioned): state is Positioned =>
  state.status === 'POSITIONED';

// Check that a place command falls within the canvas
const newPositionIsValid = (position: { x: number; y: number }, canvas: Canvas): boolean => {
  if (position.x < 0 || position.x >= canvas.w || position.y < 0 || position.y >= canvas.h) {
    return false;
  }

  return true;
};

export const robotReducer = (state: RobotState, instruction: Instruction): RobotState => {
  // Handle "PLACE" separately, to streamline checking for "POSITIONED" status
  if (instruction.type === 'PLACE') {
    const { canvas } = state;
    const { x, y, facing } = instruction;

    // If the place instruction is outside the bounds of the canvas, ignore it
    if (!newPositionIsValid({ x, y }, canvas)) {
      return { ...state };
    }

    return { ...state, status: 'POSITIONED', x, y, facing };
  } else {
    // Exit early if the robot isn't positioned yet
    if (!isPositioned(state)) {
      return { ...state };
    }

    switch (instruction.type) {
      case 'MOVE': {
        const newPosition = { x: state.x, y: state.y };

        switch (state.facing) {
          case 'NORTH':
            newPosition.y += MOVE_AMOUNT;
            break;
          case 'SOUTH':
            newPosition.y -= MOVE_AMOUNT;
            break;
          case 'EAST':
            newPosition.x += MOVE_AMOUNT;
            break;
          case 'WEST':
            newPosition.x -= MOVE_AMOUNT;
            break;
        }

        if (!newPositionIsValid(newPosition, state.canvas)) {
          return { ...state };
        }

        return { ...state, ...newPosition };
      }
      case 'LEFT':
      case 'RIGHT': {
        const newFacing = getNewFacing(instruction.type, state.facing);
        return { ...state, facing: newFacing };
      }
      default:
        return state;
    }
  }
};
