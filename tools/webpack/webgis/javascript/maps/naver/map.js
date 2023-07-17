import { LocalStorage } from '../Storage';
import { roundCustom } from '../math';

const localStorage = new LocalStorage();

let isMapTypeHybrid = false;

const mapOptions = {
  center: new naver.maps.LatLng(
    localStorage.latitude || window.webgis.center.latitude,
    localStorage.longitude || window.webgis.center.longitude,
  ),
  zoom: 17,
  minZoom: 11,
  maxZoom: 21,
  // Controls
  scaleControlOptions: {
    position: naver.maps.Position.BOTTOM_LEFT,
  },
  // Interactions
  draggable: false,
  pinchZoom: false,
  scrollWheel: false,
  disableDoubleClickZoom: true,
  disableDoubleTapZoom: true,
  disableTwoFingerTapZoom: true,
  // Others
  tileTransition: false,
  // StyleMap
  useStyleMap: true,
  mapTypes: new naver.maps.MapTypeRegistry({
    'normal': naver.maps.NaverStyleMapTypeOption.getNormalMap({
      overlayType: 'bg.ol.sw.ar.lko',
    }),
    'hybrid': naver.maps.NaverStyleMapTypeOption.getHybridMap({
      overlayType: 'bg.ol.sw.ar.lko',
    }),
  }),
};

const map = new naver.maps.Map('map', mapOptions);

naver.maps.Event.addListener(map, 'tilesloaded', function () {
  const center = map.getCenter();
  localStorage.latitude = roundCustom(center.lat());
  localStorage.longitude = roundCustom(center.lng());
});

const mapTypeButton = document.getElementById('btn-map-hybrid');
mapTypeButton.addEventListener('mousedown', onClickMapTypeButton);

function onClickMapTypeButton(event) {
  event.preventDefault();

  isMapTypeHybrid = !isMapTypeHybrid;
  mapTypeButton.classList.toggle('active', isMapTypeHybrid);

  if (isMapTypeHybrid) {
    mapTypeButton.textContent = '위성 지도';
    map.setMapTypeId(naver.maps.MapTypeId.HYBRID);
  } else {
    mapTypeButton.textContent = '일반 지도';
    map.setMapTypeId(naver.maps.MapTypeId.NORMAL);
  }
}

window.addEventListener('resize', function () {
  map.refresh();
},
{ passive: true },
);

const viewSyncOptions = {
  zoom: {
    base: 12.34,
    max: 16,
    decimal: 0.34,
    coefficient: 1,
    delta: 5,
  },
  rotation: 0,
};

export {
  map,
  viewSyncOptions,
};
