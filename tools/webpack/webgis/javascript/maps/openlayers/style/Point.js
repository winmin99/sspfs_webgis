import { Circle, Fill, Icon, Stroke, Style, Text } from 'ol/style';
import { default as StyleMap } from './Style';

const selectPointStyle = new Style({
  image: new Circle({
    stroke: new Stroke({
      color: '#ff1744',
      width: 4,
    }),
    radius: 25,
  }),
});

const selectPointSpiStyle = new Style({
  image: new Circle({
    stroke: new Stroke({
      color: '#ff1744',
      width: 4,
    }),
    radius: 15,
  }),
});

const pointStyleMap = new StyleMap({
  identifier: 'point',
  styleFunction: function (opt) {
    return new Style({
      image: new Icon({
        opacity: opt.image.opacity,
        // 현재 svg 사용하면 IE 사용 불가
        src: `/assets/media/symbols/${opt.image.src}.png`,
        scale: opt.image.scale,
        rotateWithView: false,
      }),
      text: new Text({
        overflow: true,
        font: opt.text.font,
        placement: 'point',
        fill: new Fill({
          color: opt.text.color,
        }),
        stroke: new Stroke({
          color: opt.text.stroke,
          width: opt.text.width,
        }),
        offsetY: opt.text.offsetY,
      }),
    });
  },
});

const pointSpiStyleMap = new StyleMap({
  identifier: 'spi',
  styleFunction: function (opt) {
    return new Style({
      image: new Circle({
        fill: new Fill({
          color: opt.image.fill,
        }),
        stroke: new Stroke({
          // color: '#FFFFFF',
          color: '#00000080',
          width: 2,
        }),
        radius: opt.image.radius,
      }),
    });
  },
});

export { pointStyleMap, pointSpiStyleMap, selectPointStyle, selectPointSpiStyle };
