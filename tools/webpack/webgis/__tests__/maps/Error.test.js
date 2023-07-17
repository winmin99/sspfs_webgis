import { default as MapError } from '../../maps/Error';

describe('maps.Error', () => {
  test('is an instanceof Error', () => {
    const error = new MapError();
    expect(error).toBeInstanceOf(Error);
  });
});
