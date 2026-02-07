import { describe, it, expect } from 'vitest';
import {
  mapWmoCode,
  isPrecipitation,
  isFrozenPrecipitation,
  isDangerous,
  getSupportedWmoCodes,
  WMO_CODE_MAP,
} from '../wmoCodeMapper';

describe('WMO Code Mapper', () => {
  describe('mapWmoCode', () => {
    it('maps clear sky (code 0) correctly', () => {
      const result = mapWmoCode(0);
      expect(result.condition).toBe('clear');
      expect(result.label).toBe('Clear sky');
      expect(result.severity).toBe('info');
    });

    it('maps mainly clear (code 1) correctly', () => {
      const result = mapWmoCode(1);
      expect(result.condition).toBe('clear');
      expect(result.severity).toBe('info');
    });

    it('maps cloudy conditions correctly', () => {
      expect(mapWmoCode(2).condition).toBe('cloudy');
      expect(mapWmoCode(3).condition).toBe('cloudy');
    });

    it('maps fog conditions correctly', () => {
      expect(mapWmoCode(45).condition).toBe('fog');
      expect(mapWmoCode(45).severity).toBe('moderate');
      expect(mapWmoCode(48).condition).toBe('fog');
    });

    it('maps drizzle conditions correctly', () => {
      expect(mapWmoCode(51).condition).toBe('drizzle');
      expect(mapWmoCode(53).condition).toBe('drizzle');
      expect(mapWmoCode(55).condition).toBe('drizzle');
    });

    it('maps freezing drizzle correctly', () => {
      expect(mapWmoCode(56).condition).toBe('freezing');
      expect(mapWmoCode(56).severity).toBe('moderate');
      expect(mapWmoCode(57).condition).toBe('freezing');
      expect(mapWmoCode(57).severity).toBe('high');
    });

    it('maps rain conditions correctly', () => {
      expect(mapWmoCode(61).condition).toBe('rain');
      expect(mapWmoCode(63).condition).toBe('rain');
      expect(mapWmoCode(65).condition).toBe('heavy_rain');
      expect(mapWmoCode(65).severity).toBe('moderate');
    });

    it('maps freezing rain correctly', () => {
      expect(mapWmoCode(66).condition).toBe('freezing');
      expect(mapWmoCode(66).severity).toBe('high');
      expect(mapWmoCode(67).condition).toBe('ice');
      expect(mapWmoCode(67).severity).toBe('severe');
    });

    it('maps snow conditions correctly', () => {
      expect(mapWmoCode(71).condition).toBe('snow');
      expect(mapWmoCode(73).condition).toBe('snow');
      expect(mapWmoCode(75).condition).toBe('heavy_snow');
      expect(mapWmoCode(75).severity).toBe('high');
      expect(mapWmoCode(77).condition).toBe('snow');
    });

    it('maps rain showers correctly', () => {
      expect(mapWmoCode(80).condition).toBe('rain');
      expect(mapWmoCode(81).condition).toBe('rain');
      expect(mapWmoCode(82).condition).toBe('heavy_rain');
      expect(mapWmoCode(82).severity).toBe('high');
    });

    it('maps snow showers correctly', () => {
      expect(mapWmoCode(85).condition).toBe('snow');
      expect(mapWmoCode(86).condition).toBe('heavy_snow');
    });

    it('maps thunderstorm conditions correctly', () => {
      expect(mapWmoCode(95).condition).toBe('thunderstorm');
      expect(mapWmoCode(95).severity).toBe('high');
      expect(mapWmoCode(96).condition).toBe('thunderstorm');
      expect(mapWmoCode(96).severity).toBe('severe');
      expect(mapWmoCode(99).condition).toBe('thunderstorm');
      expect(mapWmoCode(99).severity).toBe('severe');
    });

    it('returns unknown for unmapped codes', () => {
      const result = mapWmoCode(999);
      expect(result.condition).toBe('unknown');
      expect(result.label).toBe('Unknown conditions');
      expect(result.severity).toBe('info');
    });

    it('returns unknown for negative codes', () => {
      const result = mapWmoCode(-1);
      expect(result.condition).toBe('unknown');
    });
  });

  describe('isPrecipitation', () => {
    it('returns true for drizzle codes (51-57)', () => {
      expect(isPrecipitation(51)).toBe(true);
      expect(isPrecipitation(55)).toBe(true);
      expect(isPrecipitation(57)).toBe(true);
    });

    it('returns true for rain codes (61-67)', () => {
      expect(isPrecipitation(61)).toBe(true);
      expect(isPrecipitation(65)).toBe(true);
      expect(isPrecipitation(67)).toBe(true);
    });

    it('returns true for snow codes (71-77)', () => {
      expect(isPrecipitation(71)).toBe(true);
      expect(isPrecipitation(75)).toBe(true);
      expect(isPrecipitation(77)).toBe(true);
    });

    it('returns true for shower codes (80-86)', () => {
      expect(isPrecipitation(80)).toBe(true);
      expect(isPrecipitation(82)).toBe(true);
      expect(isPrecipitation(86)).toBe(true);
    });

    it('returns true for thunderstorm codes (95-99)', () => {
      expect(isPrecipitation(95)).toBe(true);
      expect(isPrecipitation(99)).toBe(true);
    });

    it('returns false for clear/cloudy codes', () => {
      expect(isPrecipitation(0)).toBe(false);
      expect(isPrecipitation(1)).toBe(false);
      expect(isPrecipitation(2)).toBe(false);
      expect(isPrecipitation(3)).toBe(false);
    });

    it('returns false for fog codes', () => {
      expect(isPrecipitation(45)).toBe(false);
      expect(isPrecipitation(48)).toBe(false);
    });
  });

  describe('isFrozenPrecipitation', () => {
    it('returns true for freezing drizzle', () => {
      expect(isFrozenPrecipitation(56)).toBe(true);
      expect(isFrozenPrecipitation(57)).toBe(true);
    });

    it('returns true for freezing rain', () => {
      expect(isFrozenPrecipitation(66)).toBe(true);
      expect(isFrozenPrecipitation(67)).toBe(true);
    });

    it('returns true for snow', () => {
      expect(isFrozenPrecipitation(71)).toBe(true);
      expect(isFrozenPrecipitation(73)).toBe(true);
      expect(isFrozenPrecipitation(75)).toBe(true);
      expect(isFrozenPrecipitation(77)).toBe(true);
      expect(isFrozenPrecipitation(85)).toBe(true);
      expect(isFrozenPrecipitation(86)).toBe(true);
    });

    it('returns false for regular rain', () => {
      expect(isFrozenPrecipitation(61)).toBe(false);
      expect(isFrozenPrecipitation(63)).toBe(false);
      expect(isFrozenPrecipitation(65)).toBe(false);
    });

    it('returns false for regular drizzle', () => {
      expect(isFrozenPrecipitation(51)).toBe(false);
      expect(isFrozenPrecipitation(53)).toBe(false);
      expect(isFrozenPrecipitation(55)).toBe(false);
    });
  });

  describe('isDangerous', () => {
    it('returns true for high severity conditions', () => {
      expect(isDangerous(57)).toBe(true); // Dense freezing drizzle
      expect(isDangerous(66)).toBe(true); // Light freezing rain
      expect(isDangerous(75)).toBe(true); // Heavy snow
      expect(isDangerous(82)).toBe(true); // Violent rain showers
      expect(isDangerous(95)).toBe(true); // Thunderstorm
    });

    it('returns true for severe conditions', () => {
      expect(isDangerous(67)).toBe(true); // Heavy freezing rain
      expect(isDangerous(96)).toBe(true); // Thunderstorm with hail
      expect(isDangerous(99)).toBe(true); // Thunderstorm with heavy hail
    });

    it('returns false for low severity conditions', () => {
      expect(isDangerous(0)).toBe(false); // Clear
      expect(isDangerous(51)).toBe(false); // Light drizzle
      expect(isDangerous(61)).toBe(false); // Slight rain
    });

    it('returns false for moderate severity conditions', () => {
      expect(isDangerous(45)).toBe(false); // Fog
      expect(isDangerous(65)).toBe(false); // Heavy rain
      expect(isDangerous(71)).toBe(false); // Slight snow
    });
  });

  describe('getSupportedWmoCodes', () => {
    it('returns all supported WMO codes', () => {
      const codes = getSupportedWmoCodes();
      expect(codes).toContain(0);
      expect(codes).toContain(99);
      expect(codes.length).toBe(Object.keys(WMO_CODE_MAP).length);
    });

    it('returns numeric codes', () => {
      const codes = getSupportedWmoCodes();
      codes.forEach(code => {
        expect(typeof code).toBe('number');
      });
    });
  });
});
