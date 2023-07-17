import { default as MapObject } from '../../Object';
import MapError from '../../Error';
import { Group as LayerGroup } from 'ol/layer';
import Collection from 'ol/Collection';

export default class Layer extends MapObject {

  constructor(options = {}) {
    super(options);

    this._layerMap = new Map();

    this._layerGroup = new LayerGroup();

    this._updateLayerGroup = function () {
      this._layerGroup.setLayers(
        new Collection([...this._layerMap.values()]),
      );
    };
  }

  get keys() {
    return this._layerMap.keys();
  }

  get layers() {
    return this._layerGroup;
  }

  hasLayer(key) {
    return this._layerMap.has(key);
  }

  getLayer(key) {
    if (this._layerMap.has(key)) {
      return this._layerMap.get(key);
    }
    throw new MapError();
  }

  clearLayers() {
    this._layerMap.clear();
    this._updateLayerGroup();
  }

  toggleLayers(keyArray, layerCreatorFunction) {
    if (!(keyArray instanceof Array)) {
      throw new MapError();
    }
    keyArray.forEach(function (key) {
      if (this._layerMap.has(key)) {
        this._layerMap.delete(key);
      } else {
        let newLayer = layerCreatorFunction(key);
        this._layerMap.set(key, newLayer);
      }
    }, this);
    this._updateLayerGroup();
  }

  setLayerVisible(keyArray, isVisible) {
    if (!(keyArray instanceof Array)) {
      throw new MapError();
    }
    keyArray.forEach(function (key) {
      if (this._layerMap.has(key)) {
        this._layerMap.get(key).setVisible(isVisible);
      }
    }, this);
  }

  showLayers(keyArray) {
    this.setLayerVisible(keyArray, true);
  }

  hideLayers(keyArray) {
    this.setLayerVisible(keyArray, false);
  }
}
