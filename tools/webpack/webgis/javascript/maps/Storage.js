import { default as MapObject } from './Object';
import { default as MapError } from './Error';

/**
 * @classdesc
 */
class Storage extends MapObject {

  constructor(options, storage) {
    options = Object.assign({}, options);
    if (!options.name) {
      options.name = 'webgis';
    }
    if (!options.version) {
      options.version = '1.0.0';
    }
    super(options);

    this._options = options;
    this._storage = storage;
    this._parsedStorage = JSON.parse(this._storage.getItem(this._options.name) || '{}');
  }

  get name() {
    return this._options.name;
  }

  get version() {
    return this._options.version;
  }

  /**
   *
   * @param key
   * @returns {*}
   * @override
   */
  get(key) {
    return this.getItem(key);
  }

  getItem(key) {
    return this._parsedStorage[key];
  }

  /**
   *
   * @param key
   * @param value
   * @override
   */
  set(key, value) {
    this.setItem(key, value);
  }

  setItem(key, value) {
    this._parsedStorage[key] = value;
    let json = JSON.stringify(this._parsedStorage);
    this._storage.setItem(this._options.name, json);
  }

  remove(key) {
    this._storage.removeItem(key);
  }

  clear() {
    this._storage.clear();
  }
}

export class LocalStorage extends Storage {

  constructor(options) {
    super(options, localStorage);

    if (LocalStorage.exists) {
      return LocalStorage.instance;
    }
    LocalStorage.instance = this;
    LocalStorage.exists = true;

    this._key_latitude = 'lat';
    this._key_longitude = 'lng';
    return this;
  }

  get latitude() {
    const latitude = super.get(this._key_latitude);
    return latitude !== 0 ? latitude : window.webgis.center.latitude;
  }

  set latitude(value) {
    if (value.constructor.name !== 'Number') {
      throw new MapError('Invalid Type', 30);
    }
    super.set(this._key_latitude, value);
  }

  get longitude() {
    const longitude = super.get(this._key_longitude);
    return longitude !== 0 ? longitude : window.webgis.center.longitude;
  }

  set longitude(value) {
    if (value.constructor.name !== 'Number') {
      throw new MapError('Invalid Type');
    }
    super.set(this._key_longitude, value);
  }
}

/**
 * @classdesc
 */
export class SessionStorage extends Storage {

  constructor(options) {
    super(options, sessionStorage);

    if (SessionStorage.exists) {
      return SessionStorage.instance;
    }
    SessionStorage.instance = this;
    SessionStorage.exists = true;

    return this;
  }
}

export const customLocalStorage = new LocalStorage();

export const customSessionStorage = new SessionStorage();
