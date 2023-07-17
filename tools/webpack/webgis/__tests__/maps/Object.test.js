import { default as MapObject } from '../../maps/Object';

describe('maps.Object', () => {
  test('#get()', () => {
    const mapObject = new MapObject({ user: 'John', email: 'john@test.com' });
    expect(mapObject.get('user')).toBe('John');
  });

  describe('#set()', () => {
    test('#set()', () => {
      const mapObject = new MapObject({ user: 'John', email: 'john@test.com' });
      expect(() => { mapObject.set('phone', '01020200714'); }).not.toThrow();
      expect(mapObject.get('phone')).toBe('01020200714');
    });

    test('#set() undefined parameter value throws an Error', () => {
      const mapObject = new MapObject({ user: 'John', email: 'john@test.com' });
      expect(() => { mapObject.set('address'); }).toThrow();
    });
  });

  test('#unset()', () => {
    const mapObject = new MapObject({ user: 'John', email: 'john@test.com' });
    expect(() => { mapObject.unset('user'); }).not.toThrow();
    expect(mapObject.get('user')).not.toBeDefined();
    expect(mapObject.get('email')).toBeDefined();
  });
});
