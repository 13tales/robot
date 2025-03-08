import { Instruction, RobotState } from 'src/main.js';

export const robotReducer = (state: RobotState, instruction: Instruction): RobotState => {
  switch (instruction.type) {
    case 'PLACE':
      return { ...state, ...instruction };
    case 'MOVE':
      return { ...state, ...instruction };
    case 'LEFT':
      return { ...state, ...instruction };
    case 'RIGHT':
      return { ...state, ...instruction };
    default:
      return state;
  }
};
