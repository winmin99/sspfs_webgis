import { Image as ImageLayer } from 'ol/layer';
import { ImageWMS } from 'ol/source';
import Layer from './Layer';
import property from './Layer.property';

export default class Image extends Layer {

  constructor(options) {
    super(options);

    this._isMapTypeIdHybrid = false;
  }

  toggleLayers(keyArray) {
    super.toggleLayers(keyArray, createImageLayer);
  }

  toggleMapTypeId() {
    this._isMapTypeIdHybrid = !this._isMapTypeIdHybrid;
  }

  updateParamsByZoom(zoom) {
    if (this.hasLayer('geo_line_as')) {
      this.getLayer('geo_line_as').getSource().updateParams({
        ENV: this._isMapTypeIdHybrid === true && zoom < 15 ? 'COLOR:#FFFF5A' : 'COLOR:#1118A8',
      });
    }
  }
}

function createImageLayer(key) {
  return new ImageLayer({
    maxZoom: property[key].maxZ,
    minZoom: property[key].minZ,
    source: createImageSource(key),
  });
}

function createImageSource(key) {
  return new ImageWMS({
    url: createImageSourceRequestUrl(),
    hidpi: false,
    imageSmoothing: false,
    params: {
      FORMAT: 'image/svg',
      LAYERS: `${window.webgis.workspace}:${key}`,
      STYLES: null,
      TILED: false,
      VERSION: '1.1.1',
      ENV: 'COLOR:#1118A8',
    },
    ratio: 1,
  });
}

function createImageSourceRequestUrl() {
  return `${window.webgis.geoserverHost}/geoserver/${window.webgis.workspace}/wms`;
}
