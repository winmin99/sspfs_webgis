import { getCenter } from 'ol/extent';
import { fromLonLat } from 'ol/proj';
import { geoJson } from './format';
import { default as projection } from './projection';
// import { searchCoordinateToAddress } from '../naver/geoCoder';
import { coordinateToAddress } from '../kakao/geoCoder';
import { map as kakaoMap, marker as kakaoMarker, viewSyncOptions } from '../kakao/map';
import { addressOverlay, hoverOverlay } from './overlay';
import { selectInteraction } from './map';

// function onSingleClick() {
// Do NOT use #preventDefault(), it blocks select interaction
// }

function onContextMenu(event) {
  event.preventDefault();
  coordinateToAddress(event.coordinate)
    .then(htmlContent => {
      addressOverlay.setPositionAndContent(event.coordinate, htmlContent);
    });
}

let currentFeatureId = null;

function onPointerMove(event) {
  if (event.dragging || this['layer'] === undefined) {
    return;
  }
  const pixel = this['map'].getEventPixel(event.originalEvent);
  this['layer'].getFeatures(pixel).then(features => {
    const feature = features.length ? features[0] : undefined;
    if (features.length) {
      if (currentFeatureId !== feature.getId() && feature.get('상세내용').trim().length > 0) {
        hoverOverlay.setPositionAndContent(event.coordinate, feature.get('상세내용').trim());
        currentFeatureId = feature.getId();
      }
    } else {
      $(hoverOverlay.getElement()).popover('hide');
      currentFeatureId = null;
    }
  });
}

function setCenterOnSelect(view, element) {
  const latLng = element.nextElementSibling.textContent.split(',');
  const coords = fromLonLat([latLng[0], latLng[1]], projection);
  view.setCenter(coords);
  if (view.getZoom() < viewSyncOptions.zoom.base) {
    view.setZoom(viewSyncOptions.zoom.base + 1);
  }
  addressOverlay.setPositionAndContent(coords, element.textContent);
  kakaoMarker.setPosition(new kakao.maps.LatLng(latLng[1], latLng[0]));
  kakaoMarker.setMap(kakaoMap);
}

function onSelectQuickSearch(event) {
  event.preventDefault();
  let targetEl = event.target;
  if (targetEl) {
    if (targetEl.className.includes('quick-search-result-facility')) {
      const coordinate = targetEl.nextElementSibling.textContent;
      const feature = geoJson.readFeature(coordinate);
      const coords = getCenter(feature.getGeometry().getExtent());
      this.setCenter(coords);
      if (this.getZoom() < viewSyncOptions.zoom.base) {
        this.setZoom(viewSyncOptions.zoom.base + 1);
      }
      selectInteraction.addFeature(feature);
    } else if (targetEl.className.includes('quick-search-result-address')) {
      setCenterOnSelect(this, targetEl);
    }
  }
}

function onSelectQuickSearchSingleResult(event) {
  event.preventDefault();
  const targetEl =
    document.querySelector('.quick-search-result-place') ||
    document.querySelector('.quick-search-result-road');
  setCenterOnSelect(this, targetEl);
}

function onClickSectionCode(event) {
  event.preventDefault();

  const mapContainer = document.getElementById('map-container');
  const centerX = Math.round(mapContainer.clientWidth / 2);
  const centerY = Math.round(mapContainer.clientHeight / 2);

  const elementId = event.target.id.split(':');
  const [table, column, section] = [elementId[0], elementId[1], elementId[2]];

  const view = this['view'];
  const size = this['size'];

  $.ajax({
    url: `${window.location.origin}/api/wtl/section`,
    headers: {
      'CSRF-Token': $('meta[name=\'csrf-token\']').attr('content'),
    },
    data: {
      table, column, section,
    },
    dataType: 'json',
    success: function (res) {
      let feature = geoJson.readFeature(res['rows'][0]['coordinate']);
      let extent = getCenter(feature.getGeometry().getExtent());
      view.centerOn(extent, size, [centerX, centerY]);
    },
  });
}

function onClickTableCodeAside(event) {
  event.preventDefault();
  const targetEl = event.target;
  // Do not allow toggle of ol-table-code-geo road/building tile layer & always show it
  if (targetEl.id === 'n3a_a0010000') return;

  if (this.hasLayer(targetEl.id)) {
    targetEl.classList.add('fa-minus-square', 'text-danger');
    targetEl.classList.remove('fa-check-square', 'text-primary');
  } else {
    targetEl.classList.add('fa-check-square', 'text-primary');
    targetEl.classList.remove('fa-minus-square', 'text-danger');
  }
  this.toggleLayers([targetEl.id]);
}

function onClickTableCodeTop(event) {
  event.preventDefault();
  const targetEl = event.target;
  // Do not allow toggle of ol-table-code-geo road/building tile layer & always show it
  if (targetEl.id === 'n3a_a0010000') return;

  if (this['layer'].hasLayer(targetEl.id)) {
    targetEl.classList.remove('active');
  } else {
    targetEl.classList.add('active');
  }
  this['layer'].toggleLayers([targetEl.id]);

  this['layer'].updateParamsByZoom(~~this['view'].getZoom());
}

function onImageLayerUpdate(event) {
  event.preventDefault();

  if (event.target.id === 'btn-map-hybrid') {
    this['layer'].toggleMapTypeId();
  }

  this['layer'].updateParamsByZoom(~~this['view'].getZoom());
}

function onWindowLoad(event) {
  event.preventDefault();

  const menuNavEl = document.querySelector('.menu-nav');

  menuNavEl.querySelector('#viw_wtt_wutl_ht').id = window.webgis.table.repair;

  let menuLabelEl = menuNavEl.querySelectorAll('span.menu-label > i.ol-table-code-wtl');
  menuLabelEl.forEach(element => {
    if (this.hasLayer(element.id)) {
      element.classList.add('fas', 'fa-check-square', 'text-primary');
    } else {
      element.classList.add('fas', 'fa-minus-square', 'text-danger');
    }
  });
  let role = '상수'; // TODO: Add Role
  switch (role) {
    case '상수': {
      let menuItemEl = menuNavEl.querySelectorAll('li.menu-item-wtl');
      menuItemEl.forEach(element => {
        element.classList.add('menu-item-open');
      });
      break;
    }
    case '하수': {
      let menuItemEl = menuNavEl.querySelectorAll('li.menu-item-swl');
      menuItemEl.forEach(element => {
        element.classList.add('menu-item-open');
      });
      break;
    }
    default: {
      break;
    }
  }
}

export {
  // onSingleClick,
  onContextMenu,
  onPointerMove,
  onSelectQuickSearch,
  onSelectQuickSearchSingleResult,
  onClickSectionCode,
  onClickTableCodeAside,
  onClickTableCodeTop,
  onImageLayerUpdate,
  onWindowLoad,
};
