import { fromLonLat, toLonLat } from 'ol/proj';
import { roundCustom } from '../math';
import projection from '../openlayers/projection';

function coordinateToLatLng(coordinate, projection = 'EPSG:5187') {
  return new Promise(resolve => {
    const lonLat = toLonLat(coordinate, projection);
    const latLng = new naver.maps.LatLng(lonLat[1], lonLat[0]);
    resolve(latLng);
  });
}

function latLngToCoordinate(lat, lng) {
  return fromLonLat([roundCustom(lng), roundCustom(lat)], projection.getCode());
}

export {
  coordinateToLatLng,
  latLngToCoordinate,
};
