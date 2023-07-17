import { LocalStorage, SessionStorage } from '../../maps/Storage';

describe('LocalStorage (extends maps.Storage)', () => {
  describe('constructor', () => {
    test('set default name and version', () => {
      const storage = new LocalStorage();
      expect(storage.name).toBe('webgis');
      expect(storage.version).toBe('1.0.0');
    });
  });

  describe('#get() #set()', () => {
    test('#set() simple key-value pair', () => {
      const storage = new LocalStorage();
      expect(() => {storage.set('aNumber', 1207);}).not.toThrow();
      expect(storage.get('aNumber')).toBe(1207);
    });

    test('#set() Object, Boolean as value', () => {
      const storage = new LocalStorage();
      expect(() => {storage.set('prop', { aNumber: 1207 });}).not.toThrow();
      expect(storage.get('prop').aNumber).toBe(1207);

      expect(() => {storage.set('prop', { isSafe: true });}).not.toThrow();
      expect(storage.get('prop').isSafe).toBeTruthy();
    });
  });

  describe('#latitude #longitude', () => {
    test('dot notation can be used instead of #get() and #set()', () => {
      const storage = new LocalStorage();
      expect(() => {storage.latitude = 36.050;}).not.toThrow();
      expect(storage.latitude).toBe(36.050);
      expect(() => {storage.longitude = 127.030;}).not.toThrow();
      expect(storage.longitude).toBe(127.030);

      storage.set('lat', 34.000);
      storage.set('lng', 118.000);

      expect(storage.latitude).toBe(34.000);
      expect(storage.longitude).toBe(118.000);
    });

    test('#set() non-Number type throws Error', () => {
      const storage = new LocalStorage();
      expect(() => {storage.latitude = '36.050';}).toThrow();
      expect(() => {storage.longitude = '127.030';}).toThrow();
    });
  });
});

describe('SessionStorage (extends maps.Storage)', () => {
  describe('constructor', () => {
    test('set default name and version', () => {
      const storage = new SessionStorage();
      expect(storage.name).toBe('webgis');
      expect(storage.version).toBe('1.0.0');
    });
  });
});
