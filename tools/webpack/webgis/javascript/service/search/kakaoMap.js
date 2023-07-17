import { getDefaultCenter, onClickMapTypeButton, onTilesLoaded, onWindowResize } from '../../maps/kakao/util';
import { roadView, roadViewClient } from '../../maps/kakao/roadview/client';
import { default as roadViewWalker } from '../../maps/kakao/roadview/walker';

const mapOptions = {
  center: getDefaultCenter(),
  level: 3,
  draggable: true,
  disableDoubleClick: true,
  disableDoubleClickZoom: true,
  scrollwheel: true,
  tileAnimation: false,
};

const mapWrapper = document.getElementById('search_map_wrapper');
const mapContainer = document.getElementById('search_map');

const map = new kakao.maps.Map(mapContainer, mapOptions);

const mapTypeControl = new kakao.maps.MapTypeControl();
map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPLEFT);
const zoomControl = new kakao.maps.ZoomControl();
map.addControl(zoomControl, kakao.maps.ControlPosition.TOPRIGHT);

const dotSet = new Set();
const dotSrc = 'assets/media/symbols/EP002.png';
const dotSize = new kakao.maps.Size(12, 12);
const dotImage = new kakao.maps.MarkerImage(dotSrc, dotSize);

const markerSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png';
const markerSize = new kakao.maps.Size(24, 35);
const markerImage = new kakao.maps.MarkerImage(markerSrc, markerSize);

const marker = new kakao.maps.Marker({
  map: map,
  position: map.getCenter(),
  image: markerImage,
});
marker.setVisible(false);

const addressMarker = new kakao.maps.Marker({
  map: map,
});

kakao.maps.event.addListener(map, 'tilesloaded', onTilesLoaded.bind(map));

const mapTypeButton = document.getElementById('btn-map-hybrid');
mapTypeButton.addEventListener('mousedown', onClickMapTypeButton.bind({ map, mapContainer }));

window.addEventListener('resize', onWindowResize.bind(map), { passive: true });

mapWrapper.addEventListener('transitionend', onWindowResize.bind(map));

document.getElementById('kt_quick_search_inline')
  .addEventListener('click', onClickQuickSearchInline, false);

function onClickQuickSearchInline(event) {
  event.preventDefault();
  let targetEl = event.target;
  if (targetEl?.className.includes('quick-search-result-address')) {
    const latLngArray = targetEl.nextElementSibling.textContent.split(',');
    const latLng = new kakao.maps.LatLng(latLngArray[1], latLngArray[0]);
    map.setCenter(latLng);
    map.setLevel(2, { animate: true });
    addressMarker.setPosition(latLng);
    addressMarker.setTitle(targetEl.textContent);
    addressMarker.setMap(map);
  }
}

function setMapMarker(pointArray) {
  const latLng = new kakao.maps.LatLng(pointArray[1], pointArray[0]);
  map.setCenter(latLng);
  marker.setPosition(latLng);
  marker.setVisible(true);
}

function setMapMarkerSet(coordinates) {
  dotSet.forEach(dot => dot.setMap(null));
  dotSet.clear();
  if (coordinates != null) {
    let dotBounds = new kakao.maps.LatLngBounds();
    coordinates.forEach(coordinate => {
      let latLng = new kakao.maps.LatLng(coordinate[1], coordinate[0]);
      let dot = new kakao.maps.Marker({
        position: latLng,
        image: dotImage,
      });
      dot.setMap(map);
      dotSet.add(dot);
      dotBounds.extend(latLng);
    });
    map.setBounds(dotBounds);
  }
}

/**
 * kakao Road View
 */
let isActive = false;
const rvButton = document.getElementById('btn-map-roadview');
const rvContainer = document.getElementById('card_body_search_map');

kakao.maps.event.addListener(roadView, 'init', onRoadviewInit);

rvButton.addEventListener('mousedown', onClickRoadviewButton);

function onRoadviewInit() {
  roadViewWalker.setMap(map);

  kakao.maps.event.addListener(roadView, 'viewpoint_changed', function () {
    const viewpoint = roadView.getViewpoint();
    roadViewWalker.setAngle(viewpoint.pan);
  });

  kakao.maps.event.addListener(roadView, 'position_changed', function () {
    const rvPosition = roadView.getPosition();
    roadViewWalker.setPosition(rvPosition);
    map.setCenter(rvPosition);
  });
}

function onClickRoadviewButton(event) {
  event.preventDefault();

  isActive = !isActive;
  rvContainer.classList.toggle('grid-parent', isActive);
  rvButton.classList.toggle('active', isActive);
  window.dispatchEvent(new Event('resize'));

  if (isActive) {
    kakao.maps.event.addListener(map, 'click', onSingleClick);
    if (!roadViewWalker.getMap()) {
      roadViewWalker.setMap(map);
    }
    map.addOverlayMapTypeId(kakao.maps.MapTypeId.ROADVIEW);
    roadViewClient.getNearestPanoId(map.getCenter(), 10, function (panoId) {
      if (panoId) {
        roadViewWalker.setPosition(map.getCenter());
        roadView.setPanoId(panoId, map.getCenter());
      } else {
        $.notify({
          message: '로드뷰 정보가 있는 도로 영역을 클릭하세요',
        }, { type: 'primary' });
      }
    });
  } else {
    kakao.maps.event.removeListener(map, 'click', onSingleClick);
    roadViewWalker.setMap(null);
    map.removeOverlayMapTypeId(kakao.maps.MapTypeId.ROADVIEW);
  }
}

function onSingleClick(event) {
  let latLng = event.latLng;
  roadViewClient.getNearestPanoId(latLng, 10, function (panoId) {
    if (panoId) {
      roadView.setPanoId(panoId, latLng);
    }
  });
}

export {
  setMapMarker,
  setMapMarkerSet,
};
