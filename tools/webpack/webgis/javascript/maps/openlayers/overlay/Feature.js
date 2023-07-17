import { Vector as VectorLayer } from 'ol/layer';

export default class FeatureOverlay extends VectorLayer {

  constructor(options) {
    super(options);

    this._highlight = null;
  }

  setOverlay(feature) {
    if (feature !== this._highlight) {
      if (this._highlight) {
        this.getSource().removeFeature(this._highlight);
      }
      if (feature) {
        this.getSource().addFeature(feature);
      }
      this._highlight = feature;
    }
  }

  addFeature(feature) {
    this.getSource().addFeature(feature);
  }
}
