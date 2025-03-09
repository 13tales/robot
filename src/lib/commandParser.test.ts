import { commandParser, parseInstruction } from './commandParser.js';
import { Instruction } from './types.js';

describe('commandParser', () => {
  describe('PLACE instruction', () => {
    it('should parse valid PLACE instructions with parameters within canvas bounds', () => {
      const input = 'PLACE 0,0,NORTH';
      const expected: Instruction[] = [{ type: 'PLACE', x: 0, y: 0, facing: 'NORTH' }];

      const result = commandParser(input);

      expect(result).toEqual(expected);
    });

    it('should parse valid PLACE instructions with parameters at canvas bounds', () => {
      const input = 'PLACE 4,4,EAST';
      const expected: Instruction[] = [{ type: 'PLACE', x: 4, y: 4, facing: 'EAST' }];

      const result = commandParser(input);

      expect(result).toEqual(expected);
    });

    it('should return an empty array for PLACE with invalid facing direction', () => {
      const input = 'PLACE 2,2,NORTHWEST';

      const result = commandParser(input);

      expect(result).toEqual([]);
    });

    it('should return an empty array for PLACE with non-numeric coordinates', () => {
      const input = 'PLACE x,y,WEST';

      const result = commandParser(input);

      expect(result).toEqual([]);
    });

    it('should return an empty array for PLACE with missing parameters', () => {
      const input = 'PLACE 2,3';

      const result = commandParser(input);

      expect(result).toEqual([]);
    });
  });

  describe('Other valid instructions', () => {
    it('should parse MOVE instruction', () => {
      const input = 'MOVE';
      const expected: Instruction[] = [{ type: 'MOVE' }];

      const result = commandParser(input);

      expect(result).toEqual(expected);
    });

    it('should parse LEFT instruction', () => {
      const input = 'LEFT';
      const expected: Instruction[] = [{ type: 'LEFT' }];

      const result = commandParser(input);

      expect(result).toEqual(expected);
    });

    it('should parse RIGHT instruction', () => {
      const input = 'RIGHT';
      const expected: Instruction[] = [{ type: 'RIGHT' }];

      const result = commandParser(input);

      expect(result).toEqual(expected);
    });

    it('should parse REPORT instruction', () => {
      const input = 'REPORT';
      const expected: Instruction[] = [{ type: 'REPORT' }];

      const result = commandParser(input);

      expect(result).toEqual(expected);
    });

    it('should ignore invalid instructions', () => {
      const input = 'JUMP';

      const result = commandParser(input);

      expect(result).toEqual([]);
    });
  });

  describe('Multiple instructions', () => {
    it('should parse multiple valid instructions on separate lines', () => {
      const input = 'PLACE 1,2,NORTH\nMOVE\nRIGHT\nREPORT';
      const expected: Instruction[] = [
        { type: 'PLACE', x: 1, y: 2, facing: 'NORTH' },
        { type: 'MOVE' },
        { type: 'RIGHT' },
        { type: 'REPORT' },
      ];

      const result = commandParser(input);

      expect(result).toEqual(expected);
    });

    it('should skip invalid instructions when processing multiple instructions', () => {
      const input = 'PLACE 1,1,NORTH\nJUMP\nMOVE\nPLACE 10,10,EAST\nREPORT';
      const expected: Instruction[] = [
        { type: 'PLACE', x: 1, y: 1, facing: 'NORTH' },
        { type: 'MOVE' },
        { type: 'REPORT' },
      ];

      const result = commandParser(input);

      expect(result).toEqual(expected);
    });

    it('should only process the first command on each line', () => {
      const input = 'PLACE 1,1,NORTH MOVE\nMOVE LEFT\nREPORT PLACE 2,2,EAST';
      const expected: Instruction[] = [
        { type: 'PLACE', x: 1, y: 1, facing: 'NORTH' },
        { type: 'MOVE' },
        { type: 'REPORT' },
      ];

      const result = commandParser(input);

      expect(result).toEqual(expected);
    });
  });
});

describe('parseInstruction', () => {
  describe('Valid commands', () => {
    it('should parse valid basic commands as specified in spec.md', () => {
      expect(parseInstruction('PLACE 0,0,NORTH')).toEqual({
        type: 'PLACE',
        x: 0,
        y: 0,
        facing: 'NORTH',
      });
      expect(parseInstruction('MOVE')).toEqual({ type: 'MOVE' });
      expect(parseInstruction('LEFT')).toEqual({ type: 'LEFT' });
      expect(parseInstruction('RIGHT')).toEqual({ type: 'RIGHT' });
      expect(parseInstruction('REPORT')).toEqual({ type: 'REPORT' });
    });

    it('should parse valid commands with unexpected whitespace', () => {
      expect(parseInstruction('  PLACE 0,0,NORTH')).toEqual({
        type: 'PLACE',
        x: 0,
        y: 0,
        facing: 'NORTH',
      });
      expect(parseInstruction('PLACE  0,0,NORTH')).toEqual({
        type: 'PLACE',
        x: 0,
        y: 0,
        facing: 'NORTH',
      });
      expect(parseInstruction('PLACE 0, 0, NORTH')).toEqual({
        type: 'PLACE',
        x: 0,
        y: 0,
        facing: 'NORTH',
      });
      expect(parseInstruction('PLACE 0,0,NORTH  ')).toEqual({
        type: 'PLACE',
        x: 0,
        y: 0,
        facing: 'NORTH',
      });
      expect(parseInstruction('  MOVE  ')).toEqual({ type: 'MOVE' });
      expect(parseInstruction('  LEFT  ')).toEqual({ type: 'LEFT' });
      expect(parseInstruction('  RIGHT  ')).toEqual({ type: 'RIGHT' });
      expect(parseInstruction('  REPORT  ')).toEqual({ type: 'REPORT' });
    });
  });

  describe('Invalid commands', () => {
    it('should return null for invalid commands', () => {
      expect(parseInstruction('JUMP')).toBeNull();
      expect(parseInstruction('RUN')).toBeNull();
      expect(parseInstruction('WALK')).toBeNull();
      expect(parseInstruction('STOP')).toBeNull();
      expect(parseInstruction('')).toBeNull();
    });

    it('should return null for PLACE command with missing parameters', () => {
      expect(parseInstruction('PLACE')).toBeNull();
      expect(parseInstruction('PLACE 0')).toBeNull();
      expect(parseInstruction('PLACE 0,0')).toBeNull();
      expect(parseInstruction('PLACE ,,NORTH')).toBeNull();
      expect(parseInstruction('PLACE 0,,NORTH')).toBeNull();
      expect(parseInstruction('PLACE ,0,NORTH')).toBeNull();
    });

    it('should return null when PLACE command parameters are in wrong order', () => {
      expect(parseInstruction('PLACE NORTH,0,0')).toBeNull();
      expect(parseInstruction('PLACE 0,NORTH,0')).toBeNull();
      expect(parseInstruction('PLACE 0,0,0')).toBeNull(); // Facing should be a direction
    });

    it('should return null when PLACE command parameters are incorrect', () => {
      expect(parseInstruction('PLACE x,y,NORTH')).toBeNull();
      expect(parseInstruction('PLACE 0,0,NORTHWEST')).toBeNull();
      expect(parseInstruction('PLACE -1,0,NORTH')).toBeNull();
      expect(parseInstruction('PLACE 0,-1,NORTH')).toBeNull();
      expect(parseInstruction('PLACE 0.5,0,NORTH')).toBeNull();
      expect(parseInstruction('PLACE 0,0.5,NORTH')).toBeNull();
    });
  });
});
