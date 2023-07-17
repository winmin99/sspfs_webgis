import { Fill, Stroke, Style, Text } from 'ol/style';
import { default as StyleMap } from './Style';

const selectPolygonStyle = new Style({
  fill: new Fill({
    color: '#eeff4180',
  }),
});

const polygonStyleMap = new StyleMap({
  identifier: 'polygon',
  styleFunction: function (opt) {
    return new Style({
      fill: new Fill({
        color: opt.fill.color,
      }),
      stroke: new Stroke({
        color: opt.stroke.color,
        width: opt.stroke.width,
        lineDash: opt.stroke.dash,
      }),
      text: new Text({
        overflow: true,
        font: opt.text.font,
        fill: new Fill({
          color: opt.text.color,
        }),
        stroke: new Stroke({
          color: opt.text.stroke,
          width: opt.text.width,
        }),
      }),
    });
  },
});

export { polygonStyleMap, selectPolygonStyle };
