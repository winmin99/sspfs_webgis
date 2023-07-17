import { default as MapError } from './Error';

export function setAbstract() {
  return ((function () {
    throw new MapError('Calling an abstract method.\n(Implement overriding method(s))');
  })());
}

let uidCounter = 0;

export function setUid(object) {
  return object.webgis_uid || (object.webgis_uid = String(++uidCounter));
}
