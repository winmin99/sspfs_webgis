import { setAbstract } from '../../maps/Util';
import { default as MapError } from '../../maps/Error';

describe('maps.Util', () => {
  describe('#setAbstract()', () => {

    class ExampleParentClass {
      constructor() {
      }

      getAge() {
        setAbstract();
      }
    }

    class ExampleChildClass extends ExampleParentClass {
      constructor() {
        super();
      }

      /**
       * @override
       */
      getAge() {
        return 12;
      }
    }

    test('directly calling abstract functions throws an error', () => {
      const parent = new ExampleParentClass();
      expect(() => {parent.getAge();}).toThrow(MapError);
    });

    test('...and must override first to use', () => {
      const child = new ExampleChildClass();
      expect(child.getAge()).toBe(12);
    });
  });
});
