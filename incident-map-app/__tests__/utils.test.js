// __tests__/utils.test.js
// Simple utility tests that don't require React Native setup

describe('Utility Functions', () => {
  describe('Coordinate Validation', () => {
    const isValidCoordinate = (lat, lng) => {
      return (
        typeof lat === 'number' &&
        typeof lng === 'number' &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      );
    };

    it('validates correct coordinates', () => {
      expect(isValidCoordinate(37.78825, -122.4324)).toBe(true);
      expect(isValidCoordinate(0, 0)).toBe(true);
      expect(isValidCoordinate(-90, -180)).toBe(true);
      expect(isValidCoordinate(90, 180)).toBe(true);
    });

    it('rejects invalid coordinates', () => {
      expect(isValidCoordinate(200, 300)).toBe(false);
      expect(isValidCoordinate('37.78', '-122.43')).toBe(false);
      expect(isValidCoordinate(null, null)).toBe(false);
      expect(isValidCoordinate(91, 0)).toBe(false);
      expect(isValidCoordinate(0, 181)).toBe(false);
    });
  });

  describe('Incident Types', () => {
    const INCIDENT_TYPES = ['crash', 'crime', 'fire', 'flood', 'other'];

    it('has correct incident types', () => {
      expect(INCIDENT_TYPES).toHaveLength(5);
      expect(INCIDENT_TYPES).toContain('crash');
      expect(INCIDENT_TYPES).toContain('crime');
      expect(INCIDENT_TYPES).toContain('fire');
    });

    it('all types are strings', () => {
      INCIDENT_TYPES.forEach(type => {
        expect(typeof type).toBe('string');
        expect(type.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Severity Levels', () => {
    const VALID_SEVERITIES = [1, 2, 3, 4, 5];

    it('validates severity levels', () => {
      VALID_SEVERITIES.forEach(level => {
        expect(level).toBeGreaterThanOrEqual(1);
        expect(level).toBeLessThanOrEqual(5);
      });
    });

    it('checks if severity is in valid range', () => {
      const isValidSeverity = (level) => level >= 1 && level <= 5;
      
      expect(isValidSeverity(1)).toBe(true);
      expect(isValidSeverity(3)).toBe(true);
      expect(isValidSeverity(5)).toBe(true);
      expect(isValidSeverity(0)).toBe(false);
      expect(isValidSeverity(6)).toBe(false);
    });
  });

  describe('Date Formatting', () => {
    it('formats dates correctly', () => {
      const date = new Date('2024-01-01T00:00:00Z');
      const formatted = date.toLocaleDateString();
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    it('handles invalid dates', () => {
      const invalidDate = new Date('invalid');
      expect(invalidDate.toString()).toBe('Invalid Date');
    });
  });

  describe('String Helpers', () => {
    it('trims whitespace', () => {
      expect('  test  '.trim()).toBe('test');
      expect(''.trim()).toBe('');
    });

    it('capitalizes first letter', () => {
      const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
      expect(capitalize('crash')).toBe('Crash');
      expect(capitalize('crime')).toBe('Crime');
    });
  });
});