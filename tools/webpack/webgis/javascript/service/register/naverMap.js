/* eslint-disable no-undef */
import { LocalStorage } from '../../maps/Storage';
import { roundCustom } from '../../maps/math';
import { getAddressFromLatLng } from '../../maps/naver/geoCoder';

const localStorage = new LocalStorage();

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
  scaleControlOptions: {
    position: naver.maps.Position.BOTTOM_LEFT,
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

const map = new naver.maps.Map('map', mapOptions);

const marker = new naver.maps.Marker({
  map: map,
  position: map.getCenter(),
  visible: false,
});

naver.maps.Event.addListener(map, 'tilesloaded', onNaverTilesLoaded);

naver.maps.Event.addListener(map, 'click', onNaverMapClick);

document.getElementById('kt_quick_search_inline')
  .addEventListener('click', onClickQuickSearchInline, false);

window.addEventListener('resize', onWindowResize, { passive: true });

function onNaverTilesLoaded() {
  const center = map.getCenter();
  localStorage.latitude = roundCustom(center.lat());
  localStorage.longitude = roundCustom(center.lng());
}

function onNaverMapClick(event) {
  marker.setVisible(true);
  marker.setPosition(event.coord);
  getAddressFromLatLng(event.coord).then(function (response) {
    let address = response['address'];
    let road = address['roadAddress'];
    let jibun = address['jibunAddress'];
    $('#service_register_form input[name="apm_adr_road"]')
      .val(road ? road : ' ')
      .change();
    $('#service_register_form input[name="apm_adr_jibun"]')
      .val(jibun ? jibun : ' ')
      .change();

    let code = response['results'][0]['code']['id'];
    $('#service_register_form input[name="apl_hjd"]')
      .val(code);

    let land = response['results'][0]['land'];
    $('#service_register_form input[name="apl_adr"]')
      .val(land['number1'] + (land['number2'] === '' ? '' : '-' + land['number2']));

    $('#service_register_form input[name="x"]')
      .val(event.coord['x']);

    $('#service_register_form input[name="y"]')
      .val(event.coord['y']);
  });
}

function onClickQuickSearchInline(event) {
  event.preventDefault();
  let targetEl = event.target;
  if (targetEl?.className.includes('quick-search-result-facility')) {
    $.notify({
      message: '미지원',
    }, { type: 'warning' });
  } else if (targetEl?.className.includes('quick-search-result-address')) {
    const latLng = targetEl.nextElementSibling.textContent.split(',');
    map.setCenter({ lat: latLng[1], lng: latLng[0] });
  }
}

function onWindowResize() {
  map.refresh();
}

new ResizeObserver(function () {
  document.getElementById('map').style.height = card_register.offsetHeight;
}).observe(card_register);
