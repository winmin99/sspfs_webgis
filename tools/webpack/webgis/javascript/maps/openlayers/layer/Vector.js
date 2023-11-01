import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Point } from 'ol/geom';
import { createDefaultStyle } from 'ol/style/Style';
import Layer from './Layer';
import property from './Layer.property';
import { default as loadSource } from './sourceLoader.vector';
import { default as FeatureFilter } from '../feature/filter';
import { geoJson } from '../format';
import { arrowheadStyle, closedPipeStyle, lineStyleMap, pointStyleMap, polygonStyleMap } from '../style';
import { layerSelectFilter, styleDirectionFilter, styleRotationFilter } from '../filter';

export default class Vector extends Layer {

  constructor(options) {
    super(options);

    if (window.webgis.table.filter) {
      FeatureFilter.init(this);
    }
  }

  toggleLayers(keyArray) {
    super.toggleLayers(keyArray, createVectorLayer);
  }
}

function createVectorLayer(key) {
  const vectorLayer = new VectorLayer({
    maxZoom: property[key].maxZ,
    minZoom: property[key].minZ,
    source: key.includes('filter') ? new VectorSource() : createVectorSource(key),
    // style: createVectorStyle,
    style: createVectorStyleTemp,
  });
  if (!layerSelectFilter.has(key)) {
    vectorLayer.set('selectable', true, true);
  }
  return vectorLayer;
}

function createVectorSource(key) {
  return new VectorSource({
    format: geoJson,
    overlaps: false,
    loader: function (extent, resolution, projection, success, failure) {
      const url = createVectorSourceRequestUrl(key);
      loadSource(this, url, extent, success, failure);
    },
  });
}

function createVectorSourceRequestUrl(key) {
  const requestParams = {
    typename: `${window.webgis.workspace}:${key}`,
    service: 'WFS',
    version: '2.0.0',
    request: 'GetFeature',
    outputFormat: 'application/json',
    propertyName: `${property[key].propertyName}`,
  };
  const requestUrl = Object
    .entries(requestParams)
    .map(([key, value]) => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('&');
  return `${window.webgis.geoserverHost}/geoserver/${window.webgis.workspace}/wfs?${requestUrl}`;
}

export function createVectorStyleTemp(feature) {
  const layer = (feature.get('레이어') || feature.get('layer') || featureId || '').trim();
  switch (feature.getGeometry().getType()) {
    case 'MultiLineString': {
    return lineStyleMap[layer]
    }
    case 'Point' : {
      return pointStyleMap[layer]
    }
  }
}

export function createVectorStyle(feature) {
  const featureId = feature.getId().match(/[^.]+/)[0];
  const layer = (feature.get('레이어') || feature.get('layer') || featureId || '').trim();
  if (layer === '') {
    return createDefaultStyle(feature, 0);
  }
  switch (feature.getGeometry().getType()) {
    case 'LineString': {
      if (feature.get('폐관일자')) {
        return closedPipeStyle;
      }
      const lineStyle = lineStyleMap[layer];
      lineStyle.setLabel(feature.get(property[featureId].label), true);
      if (!styleDirectionFilter.has(layer)) {
        return lineStyle;
      }
      let lineSegments = [];
      const _arrowheadStyle = arrowheadStyle[layer];
      feature.getGeometry().forEachSegment(function (start, end) {
        _arrowheadStyle.setGeometry(new Point(end));
        _arrowheadStyle.getImage().setRotation(fromPoints(start, end, false));
        lineSegments.push(_arrowheadStyle);
      });
      return [lineStyle, lineSegments.pop()];
    }
    case 'MultiLineString': {
      if (feature.get('폐관일자')) {
        return closedPipeStyle;
      }
      const lineStyle = lineStyleMap[layer];
      lineStyle.setLabel(feature.get(property[featureId].label), true);
      return lineStyle;
    }
    case 'Point':
    case 'MultiPoint': {
      let pointStyle = pointStyleMap[layer];
      if (property[featureId].label) {
        pointStyle.setLabel(feature.get(property[featureId].label), false);
      }
      // noinspection JSNonASCIINames,FallThroughInSwitchStatementJS
      switch (layer) {
        case '경계변':
        case '제수변':
        case '지수전': {
          const valveState = feature.get('개폐여부');
          if (valveState === '개' || valveState === '미분류') {
            break;
          }
          pointStyle = pointStyleMap[`${layer}_${valveState}`];
          break;
        }
        case '오수받이': {
          if (feature.get('관리기관') === '개인') {
            pointStyle = pointStyleMap['오수받이_개인'];
          }
          break;
        }
        case '급수전': {
          const metaState = feature.get('사용여부');
          if (metaState === undefined || metaState === null) {
            break;
          }
          pointStyle = pointStyleMap[`${layer}_${metaState}`];
          break;
        }
        default:
          break;
      }
      if (styleRotationFilter.has(layer) && feature.get('방향각') !== undefined) {
        pointStyle.getImage().setRotation(
          fromDegree(
            // CS(=MySql)의 방향각은 왼쪽 회전이 기본이며, ol 은 오른쪽회전이 기본임
            feature.get('방향각') ? feature.get('방향각').toString() : 0,
            false,
          ),
        );
      }
      return pointStyle;
    }
    case 'Polygon':
    case 'MultiPolygon': {
      const polygonStyle = polygonStyleMap[layer];
      if (property[featureId].label) {
        polygonStyle.setLabel(feature.get(property[featureId].label), false);
      }
      return polygonStyle;
    }
    default: {
      return createDefaultStyle(feature, 0);
    }
  }
}

// To convert radians to degrees, divide by (Math.PI / 180). Multiply by this to convert the other way.
function fromDegree(degree, clockwise = true) {
  return degree * 0.01745 * (clockwise ? 1 : -1);
}

// The angle in radians between the positive x-axis and the ray from (0,0) to the point.
function fromPoints(start, end, clockwise = true) {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  return Math.atan2(dy, dx) * (clockwise ? 1 : -1);
}
