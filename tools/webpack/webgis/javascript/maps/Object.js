import { setUid } from './Util';
import { default as MapError } from './Error';

export default class BaseObject {

  constructor(options) {
    setUid(this);

    this._values = {};

    if (options != null) {
      for (const key in options) {
        this._values[key] = options[key];
      }
    }
  }

  get(key) {
    let value;
    if (Object.prototype.hasOwnProperty.call(this._values, key)) {
      value = this._values[key];
    }
    return value;
  }

  set(key, value) {
    if (value === undefined) {
      throw new MapError('Value is undefined');
    }
    this._values[key] = value;
  }

  unset(key) {
    if (key in this._values) {
      delete this._values[key];
    }
  }
}
