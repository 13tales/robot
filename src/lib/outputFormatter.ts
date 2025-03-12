import { RobotState } from './types';
import { isPositioned } from './utils/utils';

export const outputFormatter = (state: RobotState): string | null => {
  if (!isPositioned(state)) {
    return null;
  } else {
    const { x, y, facing } = state;
    return `${x},${y},${facing}\n`;
  }
};
