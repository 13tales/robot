import { Canvas, Instruction } from '../../src/main.js';
import { commandParser, parseInstruction } from './commandParser.js';

describe('commandParser', () => {
  // Default canvas for testing
  const defaultCanvas: Canvas = { w: 5, h: 5 };

  describe('PLACE instruction', () => {
    it('should parse valid PLACE instructions with parameters within canvas bounds', () => {
      const input = 'PLACE 0,0,NORTH';
      const expected: Instruction[] = [{ type: 'PLACE', x: 0, y: 0, facing: 'NORTH' }];

      const result = commandParser(input, defaultCanvas);

      expect(result).toEqual(expected);
    });

    it('should parse valid PLACE instructions with parameters at canvas bounds', () => {
      const input = 'PLACE 4,4,EAST';
      const expected: Instruction[] = [{ type: 'PLACE', x: 4, y: 4, facing: 'EAST' }];

      const result = commandParser(input, defaultCanvas);

      expect(result).toEqual(expected);
    });

    it('should return an empty array for PLACE with invalid facing direction', () => {
      const input = 'PLACE 2,2,NORTHWEST';

      const result = commandParser(input, defaultCanvas);

      expect(result).toEqual([]);
    });

    it('should return an empty array for PLACE with x outside canvas bounds', () => {
      const input = 'PLACE 6,2,NORTH';

      const result = commandParser(input, defaultCanvas);

      expect(result).toEqual([]);
    });

    it('should return an empty array for PLACE with y outside canvas bounds', () => {
      const input = 'PLACE 2,6,EAST';

      const result = commandParser(input, defaultCanvas);

      expect(result).toEqual([]);
    });

    it('should return an empty array for PLACE with negative coordinates', () => {
      const input = 'PLACE -1,2,SOUTH';

      const result = commandParser(input, defaultCanvas);

      expect(result).toEqual([]);
    });

    it('should return an empty array for PLACE with non-numeric coordinates', () => {
      const input = 'PLACE x,y,WEST';

      const result = commandParser(input, defaultCanvas);

      expect(result).toEqual([]);
    });

    it('should return an empty array for PLACE with missing parameters', () => {
      const input = 'PLACE 2,3';

      const result = commandParser(input, defaultCanvas);

      expect(result).toEqual([]);
    });
  });

  describe('Other valid instructions', () => {
    it('should parse MOVE instruction', () => {
      const input = 'MOVE';
      const expected: Instruction[] = [{ type: 'MOVE' }];

      const result = commandParser(input, defaultCanvas);

      expect(result).toEqual(expected);
    });

    it('should parse LEFT instruction', () => {
      const input = 'LEFT';
      const expected: Instruction[] = [{ type: 'LEFT' }];

      const result = commandParser(input, defaultCanvas);

      expect(result).toEqual(expected);
    });

    it('should parse RIGHT instruction', () => {
      const input = 'RIGHT';
      const expected: Instruction[] = [{ type: 'RIGHT' }];

      const result = commandParser(input, defaultCanvas);

      expect(result).toEqual(expected);
    });

    it('should parse REPORT instruction', () => {
      const input = 'REPORT';
      const expected: Instruction[] = [{ type: 'REPORT' }];

      const result = commandParser(input, defaultCanvas);

      expect(result).toEqual(expected);
    });

    it('should ignore invalid instructions', () => {
      const input = 'JUMP';

      const result = commandParser(input, defaultCanvas);

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

      const result = commandParser(input, defaultCanvas);

      expect(result).toEqual(expected);
    });

    it('should skip invalid instructions when processing multiple instructions', () => {
      const input = 'PLACE 1,1,NORTH\nJUMP\nMOVE\nPLACE 10,10,EAST\nREPORT';
      const expected: Instruction[] = [
        { type: 'PLACE', x: 1, y: 1, facing: 'NORTH' },
        { type: 'MOVE' },
        { type: 'REPORT' },
      ];

      const result = commandParser(input, defaultCanvas);

      expect(result).toEqual(expected);
    });

    it('should only process the first command on each line', () => {
      const input = 'PLACE 1,1,NORTH MOVE\nMOVE LEFT\nREPORT PLACE 2,2,EAST';
      const expected: Instruction[] = [
        { type: 'PLACE', x: 1, y: 1, facing: 'NORTH' },
        { type: 'MOVE' },
        { type: 'REPORT' },
      ];

      const result = commandParser(input, defaultCanvas);

      expect(result).toEqual(expected);
    });
  });

  describe('Different canvas sizes', () => {
    it('should correctly validate PLACE with smaller canvas', () => {
      const smallCanvas: Canvas = { w: 3, h: 3 };
      const input = 'PLACE 2,2,NORTH\nPLACE 3,2,SOUTH';
      const expected: Instruction[] = [{ type: 'PLACE', x: 2, y: 2, facing: 'NORTH' }];

      const result = commandParser(input, smallCanvas);

      expect(result).toEqual(expected);
    });

    it('should correctly validate PLACE with larger canvas', () => {
      const largeCanvas: Canvas = { w: 10, h: 10 };
      const input = 'PLACE 6,8,EAST\nPLACE 9,9,WEST';
      const expected: Instruction[] = [
        { type: 'PLACE', x: 6, y: 8, facing: 'EAST' },
        { type: 'PLACE', x: 9, y: 9, facing: 'WEST' },
      ];

      const result = commandParser(input, largeCanvas);

      expect(result).toEqual(expected);
    });

    it('should correctly validate PLACE with non-square canvas', () => {
      const rectangularCanvas: Canvas = { w: 8, h: 4 };
      const input = 'PLACE 7,3,NORTH\nPLACE 5,3,SOUTH\nPLACE 8,5,WEST';
      const expected: Instruction[] = [
        { type: 'PLACE', x: 7, y: 3, facing: 'NORTH' },
        { type: 'PLACE', x: 5, y: 3, facing: 'SOUTH' },
      ];

      const result = commandParser(input, rectangularCanvas);

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
