import { getDefaultCenter, onClickTerrainMapButton, onTilesLoaded, onClickGeoMapButton } from './util';

const mapOptions = {
  center: getDefaultCenter(),
  level: 3,
  draggable: false,
  disableDoubleClick: true,
  disableDoubleClickZoom: true,
  scrollwheel: false,
  tileAnimation: false,
};

const mapContainer = document.getElementById('map');

// kakao.maps.disableHD();
const map = new kakao.maps.Map(mapContainer, mapOptions);
map.setMinLevel(1);
map.setMaxLevel(9);
// map.setZoomable(false);

kakao.maps.event.addListener(map, 'tilesloaded', onTilesLoaded.bind(map));

const terrainMapButton = document.getElementById('btn-map-terrain');
terrainMapButton.addEventListener('mousedown', onClickTerrainMapButton.bind(map));

const geoMapButton = document.getElementById('btn-map-geo');
geoMapButton.addEventListener('mousedown', onClickGeoMapButton.bind(map));

// window.addEventListener('resize', onWindowResize.bind(map), { passive: true });

const viewSyncOptions = {
  zoom: {
    base: 12.3,
    max: 14,
    decimal: 0.3,
    coefficient: -1,
    delta: 15,
  },
  rotation: -0.02307,
};

const marker = new kakao.maps.Marker({
  position: undefined,
});

kakao.maps.Map.prototype.setZoom = function (value) {
  map.setLevel(value);
};

export { map, mapContainer, marker, viewSyncOptions };
