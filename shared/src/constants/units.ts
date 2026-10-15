/**
 * Unit Constants
 * Standardized units of measurement used across the platform
 */

export enum Unit {
  CENTIMETERS = 'cm',
  METERS = 'm',
  CELSIUS = '°C',
  FAHRENHEIT = '°F',
  PERCENT = '%',
  PPM = 'ppm',
  VOLTS = 'V',
  AMPS = 'A',
  WATTS = 'W',
  OHMS = 'Ω',
  HERTZ = 'Hz',
  SECONDS = 's',
  MILLISECONDS = 'ms',
  BYTES = 'B',
  KILOBYTES = 'KB',
  MEGABYTES = 'MB',
}

export type UnitValue = `${Unit}`;

export const UNITS: UnitValue[] = Object.values(Unit);

export interface UnitInfo {
  unit: Unit;
  label: string;
  symbol: string;
  system: 'metric' | 'imperial' | 'si' | 'custom';
  baseUnit?: Unit;
  conversionFactor?: number; // To base unit
}

export const UNIT_INFO: Record<Unit, UnitInfo> = {
  [Unit.CENTIMETERS]: {
    unit: Unit.CENTIMETERS,
    label: 'Centimeters',
    symbol: 'cm',
    system: 'metric',
    baseUnit: Unit.METERS,
    conversionFactor: 0.01,
  },
  [Unit.METERS]: {
    unit: Unit.METERS,
    label: 'Meters',
    symbol: 'm',
    system: 'si',
    baseUnit: Unit.METERS,
    conversionFactor: 1,
  },
  [Unit.CELSIUS]: {
    unit: Unit.CELSIUS,
    label: 'Celsius',
    symbol: '°C',
    system: 'si',
  },
  [Unit.FAHRENHEIT]: {
    unit: Unit.FAHRENHEIT,
    label: 'Fahrenheit',
    symbol: '°F',
    system: 'imperial',
  },
  [Unit.PERCENT]: {
    unit: Unit.PERCENT,
    label: 'Percent',
    symbol: '%',
    system: 'custom',
  },
  [Unit.PPM]: {
    unit: Unit.PPM,
    label: 'Parts Per Million',
    symbol: 'ppm',
    system: 'custom',
  },
  [Unit.VOLTS]: {
    unit: Unit.VOLTS,
    label: 'Volts',
    symbol: 'V',
    system: 'si',
  },
  [Unit.AMPS]: {
    unit: Unit.AMPS,
    label: 'Amperes',
    symbol: 'A',
    system: 'si',
  },
  [Unit.WATTS]: {
    unit: Unit.WATTS,
    label: 'Watts',
    symbol: 'W',
    system: 'si',
  },
  [Unit.OHMS]: {
    unit: Unit.OHMS,
    label: 'Ohms',
    symbol: 'Ω',
    system: 'si',
  },
  [Unit.HERTZ]: {
    unit: Unit.HERTZ,
    label: 'Hertz',
    symbol: 'Hz',
    system: 'si',
  },
  [Unit.SECONDS]: {
    unit: Unit.SECONDS,
    label: 'Seconds',
    symbol: 's',
    system: 'si',
  },
  [Unit.MILLISECONDS]: {
    unit: Unit.MILLISECONDS,
    label: 'Milliseconds',
    symbol: 'ms',
    system: 'si',
    baseUnit: Unit.SECONDS,
    conversionFactor: 0.001,
  },
  [Unit.BYTES]: {
    unit: Unit.BYTES,
    label: 'Bytes',
    symbol: 'B',
    system: 'custom',
  },
  [Unit.KILOBYTES]: {
    unit: Unit.KILOBYTES,
    label: 'Kilobytes',
    symbol: 'KB',
    system: 'custom',
    baseUnit: Unit.BYTES,
    conversionFactor: 1024,
  },
  [Unit.MEGABYTES]: {
    unit: Unit.MEGABYTES,
    label: 'Megabytes',
    symbol: 'MB',
    system: 'custom',
    baseUnit: Unit.BYTES,
    conversionFactor: 1024 * 1024,
  },
};

export function getUnitInfo(unit: Unit): UnitInfo {
  return UNIT_INFO[unit];
}

export function convertUnit(value: number, from: Unit, to: Unit): number {
  const fromInfo = UNIT_INFO[from];
  const toInfo = UNIT_INFO[to];

  if (!fromInfo.baseUnit || !toInfo.baseUnit || fromInfo.baseUnit !== toInfo.baseUnit) {
    throw new Error(`Cannot convert between ${from} and ${to}`);
  }

  const baseValue = value * (fromInfo.conversionFactor ?? 1);
  return baseValue / (toInfo.conversionFactor ?? 1);
}

export function formatValue(value: number, unit: Unit, precision: number = 2): string {
  const info = UNIT_INFO[unit];
  return `${value.toFixed(precision)} ${info.symbol}`;
}

export function isValidUnit(unit: string): unit is Unit {
  return UNITS.includes(unit as Unit);
}