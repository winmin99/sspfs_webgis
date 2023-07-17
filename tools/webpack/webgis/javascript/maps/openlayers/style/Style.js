import { Fill, Style } from 'ol/style';
import { default as MapObject } from '../../Object';
import { default as MapError } from '../../Error';
import { default as config } from './style.config';

const labelFill = new Fill();

Style.prototype.setLabel = function (value = null, isColorized = false) {
  if (isColorized) {
    labelFill.setColor(this.getStroke().getColor());
    this.getText().setFill(labelFill);
  }
  this.getText().setText(value);
};

export default class StyleMap extends MapObject {

  constructor(options) {
    if (!options['identifier'] || !options['styleFunction']) {
      throw new MapError();
    }
    super();

    const styleEntries = new Map(Object.entries(config[options['identifier']]));

    const styleFunctions = options['styleFunction'];

    for (let [key, value] of styleEntries) {
      this[key] = styleFunctions(value);
    }
  }
}
