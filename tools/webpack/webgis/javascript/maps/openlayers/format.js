import { GeoJSON, WFS } from 'ol/format';
import GML32 from 'ol/format/GML32';
import { default as projection } from './projection';

const geoJson = new GeoJSON({
  dataProjection: projection,
  featureProjection: projection,
});

const geoJsonWGS = new GeoJSON({
  featureProjection: projection,
});

const wfs = new WFS({
  version: '2.0.0',
  gmlFormat: GML32,
});

export {
  geoJson,
  geoJsonWGS,
  wfs,
};
