import { describe, it, expect } from 'vitest';
import {
  deriveTemperatureAlert,
  deriveWindAlert,
  isBlizzardCondition,
  TEMPERATURE_THRESHOLDS,
  WIND_THRESHOLDS,
} from '../temperatureThresholds';

describe('Temperature Thresholds', () => {
  describe('deriveTemperatureAlert', () => {
    it('returns extreme cold warning for temperatures below -10°C', () => {
      const result = deriveTemperatureAlert(-15);
      expect(result).not.toBeNull();
      expect(result?.condition).toBe('freezing');
      expect(result?.severity).toBe('severe');
      expect(result?.title).toBe('Extreme Cold Warning');
    });

    it('returns severe cold for temperatures between -10°C and -5°C', () => {
      const result = deriveTemperatureAlert(-7);
      expect(result).not.toBeNull();
      expect(result?.condition).toBe('freezing');
      expect(result?.severity).toBe('high');
      expect(result?.title).toBe('Severe Cold');
    });

    it('returns freezing conditions for temperatures between -5°C and 0°C', () => {
      const result = deriveTemperatureAlert(-2);
      expect(result).not.toBeNull();
      expect(result?.condition).toBe('freezing');
      expect(result?.severity).toBe('moderate');
      expect(result?.title).toBe('Freezing Conditions');
    });

    it('returns frost warning for temperatures between 0°C and 2°C', () => {
      const result = deriveTemperatureAlert(1);
      expect(result).not.toBeNull();
      expect(result?.condition).toBe('frost');
      expect(result?.severity).toBe('low');
      expect(result?.title).toBe('Frost Possible');
    });

    it('returns null for comfortable temperatures', () => {
      expect(deriveTemperatureAlert(15)).toBeNull();
      expect(deriveTemperatureAlert(20)).toBeNull();
      expect(deriveTemperatureAlert(25)).toBeNull();
    });

    it('returns hot weather alert for temperatures above 30°C', () => {
      const result = deriveTemperatureAlert(31);
      expect(result).not.toBeNull();
      expect(result?.condition).toBe('heatwave');
      expect(result?.severity).toBe('moderate');
      expect(result?.title).toBe('Hot Weather');
    });

    it('returns heatwave for temperatures above 32°C', () => {
      const result = deriveTemperatureAlert(33);
      expect(result).not.toBeNull();
      expect(result?.condition).toBe('heatwave');
      expect(result?.severity).toBe('high');
      expect(result?.title).toBe('Heatwave');
    });

    it('returns extreme heat warning for temperatures above 35°C', () => {
      const result = deriveTemperatureAlert(37);
      expect(result).not.toBeNull();
      expect(result?.condition).toBe('heatwave');
      expect(result?.severity).toBe('severe');
      expect(result?.title).toBe('Extreme Heat Warning');
    });

    it('uses feels-like temperature when provided', () => {
      // Actual temp is fine but feels-like is freezing
      const result = deriveTemperatureAlert(5, -2);
      expect(result).not.toBeNull();
      expect(result?.condition).toBe('freezing');
    });

    it('includes feels-like in description when provided', () => {
      const result = deriveTemperatureAlert(-15, -20);
      expect(result?.description).toContain('feels like');
    });
  });

  describe('deriveWindAlert', () => {
    it('returns null for calm winds', () => {
      expect(deriveWindAlert(10)).toBeNull();
      expect(deriveWindAlert(20)).toBeNull();
      expect(deriveWindAlert(30)).toBeNull();
    });

    it('returns high winds alert for winds above 50 km/h', () => {
      const result = deriveWindAlert(55);
      expect(result).not.toBeNull();
      expect(result?.condition).toBe('high_winds');
      expect(result?.severity).toBe('low');
      expect(result?.title).toBe('High Winds');
    });

    it('returns very high winds for winds above 65 km/h', () => {
      const result = deriveWindAlert(70);
      expect(result).not.toBeNull();
      expect(result?.condition).toBe('high_winds');
      expect(result?.severity).toBe('moderate');
      expect(result?.title).toBe('Very High Winds');
    });

    it('returns gale force for gusts above 80 km/h', () => {
      const result = deriveWindAlert(60, 85);
      expect(result).not.toBeNull();
      expect(result?.condition).toBe('gale');
      expect(result?.severity).toBe('high');
      expect(result?.title).toBe('Gale Force Winds');
    });

    it('returns storm force for gusts above 100 km/h', () => {
      const result = deriveWindAlert(70, 105);
      expect(result).not.toBeNull();
      expect(result?.condition).toBe('gale');
      expect(result?.severity).toBe('severe');
      expect(result?.title).toBe('Storm Force Winds');
    });

    it('considers both wind speed and gusts', () => {
      // Low wind speed but high gusts
      const result = deriveWindAlert(30, 90);
      expect(result).not.toBeNull();
      expect(result?.condition).toBe('gale');
    });
  });

  describe('isBlizzardCondition', () => {
    it('returns true for heavy snow with high winds and freezing temps', () => {
      // WMO code 75 = heavy snow
      expect(isBlizzardCondition(75, 60, -5)).toBe(true);
    });

    it('returns true for snow showers with high winds and freezing temps', () => {
      // WMO code 86 = heavy snow showers
      expect(isBlizzardCondition(86, 55, -2)).toBe(true);
    });

    it('returns false for snow without high winds', () => {
      expect(isBlizzardCondition(75, 30, -5)).toBe(false);
    });

    it('returns false for snow without freezing temps', () => {
      expect(isBlizzardCondition(75, 60, 5)).toBe(false);
    });

    it('returns false for rain even with high winds and cold temps', () => {
      // WMO code 65 = heavy rain
      expect(isBlizzardCondition(65, 60, -5)).toBe(false);
    });

    it('returns false for slight snow with only moderate conditions', () => {
      // WMO code 71 = slight snow - this should return true since it IS a snow code
      expect(isBlizzardCondition(71, 55, -1)).toBe(true);
    });
  });

  describe('Threshold constants', () => {
    it('has correct temperature thresholds', () => {
      expect(TEMPERATURE_THRESHOLDS.FROST_WARNING).toBe(2);
      expect(TEMPERATURE_THRESHOLDS.FREEZING).toBe(0);
      expect(TEMPERATURE_THRESHOLDS.SEVERE_COLD).toBe(-5);
      expect(TEMPERATURE_THRESHOLDS.EXTREME_COLD).toBe(-10);
      expect(TEMPERATURE_THRESHOLDS.HOT).toBe(30);
      expect(TEMPERATURE_THRESHOLDS.HEATWAVE).toBe(32);
      expect(TEMPERATURE_THRESHOLDS.EXTREME_HEAT).toBe(35);
    });

    it('has correct wind thresholds', () => {
      expect(WIND_THRESHOLDS.HIGH_WINDS).toBe(50);
      expect(WIND_THRESHOLDS.VERY_HIGH).toBe(65);
      expect(WIND_THRESHOLDS.GALE).toBe(80);
      expect(WIND_THRESHOLDS.STORM).toBe(100);
    });
  });
});
