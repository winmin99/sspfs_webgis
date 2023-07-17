import { LocalStorage } from '../../maps/Storage';
import { roundCustom } from '../../maps/math';

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
  mapDataControl: false,
  zoomControl: false,
  mapTypeControl: true,
  mapTypeControlOptions: {
    style: naver.maps.MapTypeControlStyle.BUTTON,
    position: naver.maps.Position.TOP_LEFT,
  },
  // Interactions
  draggable: true,
  pinchZoom: true,
  scrollWheel: true,
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

const map = new naver.maps.Map('search_map', mapOptions);

const marker = new naver.maps.Marker({
  map: map,
  position: map.getCenter(),
  clickable: false,
  visible: false,
});

/**
 * 점지도 시각화하기
 *
 * @link https://navermaps.github.io/maps.js.ncp/docs/naver.maps.visualization.DotMap.html
 */
const dotMap = new naver.maps.visualization.DotMap({
  map: map,
  data: [],
  opacity: 1,
  radius: 6,
});

naver.maps.Event.addListener(map, 'tilesloaded', onNaverTilesLoaded);

const mapTypeButton = document.getElementById('btn-map-hybrid');
mapTypeButton.addEventListener('mousedown', onClickMapTypeButton);

document.getElementById('kt_quick_search_inline')
  .addEventListener('click', onClickQuickSearchInline, false);

window.addEventListener('resize', onWindowResize, { passive: true });

function onNaverTilesLoaded() {
  const center = map.getCenter();
  localStorage.latitude = roundCustom(center.lat());
  localStorage.longitude = roundCustom(center.lng());
}

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

function onWindowResize() {
  map.refresh();
}

function setMapMarker(pointArray) {
  map.setCenter(pointArray);
  marker.setPosition(pointArray);
  marker.setVisible(true);
}

function onClickSearch(coordinates) {
  addMarkers(map, coordinates);
}

function addMarkers(map, coordinates) {
  dotMap.setMap(null);
  dotMap.setData(Array.from(coordinates));
  dotMap.setMap(map);
}

function onClickQuickSearchInline(event) {
  event.preventDefault();
  let targetEl = event.target;
  if (targetEl?.className.includes('quick-search-result-address')) {
    const latLngArray = targetEl.nextElementSibling.textContent.split(',');
    const latLng = new naver.maps.LatLng(latLngArray[1], latLngArray[0]);
    map.setCenter(latLng);
    map.setZoom(19);
  }
}

export {
  onClickSearch,
  setMapMarker,
};
