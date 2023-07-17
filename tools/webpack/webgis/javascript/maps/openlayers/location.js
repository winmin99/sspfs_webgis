import { fromLonLat } from 'ol/proj';
import { viewSyncOptions } from '../kakao/map';
import { addressOverlay } from './overlay';
import projection from './projection';

const { decimal } = viewSyncOptions.zoom;

function onClickCurrentLocation(event) {
  event.preventDefault();
  const that = this;
  navigator.geolocation.getCurrentPosition(position => {
    const coords = fromLonLat([
      position.coords['longitude'],
      position.coords['latitude'],
    ], projection.getCode());
    that.setCenter(coords);
    that.setZoom(14 + decimal);
    addressOverlay.setPositionAndContent(coords, '내 위치');
  }, onLocationError);
}

function onLocationError(error) {
  $.notify({
    message: '현재 위치 정보를 가져올 수 없습니다.',
  }, { type: 'warning' });
}

export {
  onClickCurrentLocation,
};
