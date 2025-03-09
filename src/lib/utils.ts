import {
  Instruction,
  NotPositioned,
  PlaceInstruction,
  Positioned,
  ReportInstruction,
  SimpleInstruction,
} from './types';

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

export const isPositioned = (state: Positioned | NotPositioned): state is Positioned =>
  state.status === 'POSITIONED';
