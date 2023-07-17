import View from 'ol/View';
import { fromLonLat } from 'ol/proj';
import { LocalStorage } from '../Storage';
import { default as projection } from './projection';
// import { map, viewSyncOptions } from '../naver/map';
// import { coordinateToLatLng } from '../naver/util';
import { map, mapContainer, viewSyncOptions } from '../kakao/map';
import { coordinateToLatLng, onClickMapTypeButton } from '../kakao/util';

const localStorage = new LocalStorage();

const { base, max, coefficient, decimal, delta } = viewSyncOptions.zoom;
let currentZoom;

const view = new View({
  projection: projection,
  center: fromLonLat([
    localStorage.longitude || window.webgis.center.longitude,
    localStorage.latitude || window.webgis.center.latitude,
  ], projection),
  zoom: base,
  constrainResolution: false,
  constrainRotation: false,
  rotation: viewSyncOptions.rotation,
});

document.getElementById('btn-map-hybrid')
  .addEventListener('mousedown', onClickMapTypeButton.bind({ map, mapContainer, view, newZoom: max + decimal }), false);

view.on('change:center', onChangeCenter);

window.addEventListener('resize', event => {
  event.preventDefault();
  view.dispatchEvent('change:center');
  map.relayout();
}, { passive: true });

function onChangeCenter() {
  coordinateToLatLng(view.getCenter(), projection.getCode())
    .then(function (latLng) {
      map.setCenter(latLng);
    });
}

function onMoveEnd(event) {
  event.preventDefault();
  if (~~view.getZoom() !== currentZoom) {
    let newZoom = ~~view.getZoom();
    if (newZoom <= max) {
      switch (newZoom) {
        // case 5:
        //   _toggleOverlay(null);
        case 14:
          if (mapContainer.style.display !== 'block') {
            mapContainer.style.display = 'block';
          }
        // eslint-disable-next-line no-fallthrough
        case 13:
        case 12:
        case 11:
        case 10:
        case 9:
        case 8:
        case 7:
        case 6: {
          view.setZoom(newZoom + decimal);
          map.setZoom(coefficient * newZoom + delta);
          break;
        }
        default: {
          view.setZoom(5 + decimal);
          newZoom = 5;
          view.setCenter(fromLonLat([
            window.webgis.center.longitude,
            window.webgis.center.latitude,
          ], projection));
          break;
        }
      }
    } else {
      if (mapContainer.style.display !== 'none') {
        mapContainer.style.display = 'none';
      }
      if (newZoom > 20) {
        view.setZoom(20 + decimal);
      }
    }
    currentZoom = newZoom;
  }
}

export {
  onMoveEnd,
  view,
};
