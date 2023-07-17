import { formatSchedule } from '../format/register';
import { getDefaultCenter, onWindowResize } from '../../maps/kakao/util';
import { latLngToAddress } from '../../maps/kakao/geoCoder';

export default class EditModal {

  constructor(table) {
    let that = this;

    this._modalEl = $('#kt_service_edit_modal');
    this._card = this._modalEl.find('.card');
    this._cardOverlay = this._card.find('.overlay-layer');
    this._modalForm = this._modalEl.find('#service_edit_form');
    this._disabledForm = this._modalForm.find('.form-control[disabled]');
    this._csrfToken = $('meta[name=\'csrf-token\']').attr('content');

    this._id = null;
    this._x = null;
    this._y = null;

    ['apm_tel', 'apy_cde', 'lep_cde', 'opr_nam', 'pip_dip', 'pro_cde'].forEach(code => {
      this[code] = this._modalForm.find(`.form-control[name="${code}"]`);
    }, this);

    this['apm_tel'].inputmask('99[9]-999[9]-9999');

    this._modalEl.find('#kt_service_edit_submit').on('click', () => {
      that.onFormSubmit(table.ajax);
    });

    this._modalEl.find('#kt_service_edit_cancel').on('click', () => {
      that._modalEl.modal('hide');
    });

    this._modalEl.on('shown.bs.modal', () => {
      new EditModalMap().start(that._x, that._y);
    });

    this._modalEl.on('hidden.bs.modal', () => {
      that.showBlockOverlay(false);
      that._disabledForm.attr('disabled', true);
      ['lep_cde', 'pip_dip'].forEach(code => {
        that[code].parent().attr('hidden', false);
      });
    });
  }

  showModal(data) {
    let that = this;

    that._id = data.pluck('번호')[0];
    that._x = data.pluck('x')[0];
    that._y = data.pluck('y')[0];

    $.ajax({
      url: `${window.location.origin}/service/search?api=editfor&id=${that._id}`,
      headers: { 'CSRF-Token': that._csrfToken },
      type: 'POST',
      success: onSelectSuccess,
      error: onError,
    });

    function onSelectSuccess(res) {
      const resultObj = res['rows'][0];

      for (const [key, value] of Object.entries(resultObj)) {
        that._modalForm.find(`.form-control[name="${key}"]`).val(value);
      }

      formatSchedule().then(select => {
        that['opr_nam'].html(select).val(resultObj['opr_nam']).selectpicker('refresh');
      });

      ['apy_cde', 'lep_cde', 'pip_dip'].forEach(code => {
        if (resultObj[code] != null) {
          that[code].selectpicker('val', resultObj[code]);
        } else {
          that[code].val('').selectpicker('refresh');
        }
      });

      if (resultObj['apy_cde'] !== '도로 누수') {
        ['lep_cde', 'pip_dip'].forEach(code => {
          that[code].parents().eq(1).css('display', 'none');
        });
      }

      that['apy_cde'].on('change', function (event) {
        if (event.target.value === '도로 누수') {
          that['pip_dip'].parents().eq(1).css('display', 'block');
          that['lep_cde'].parents().eq(1).css('display', 'block');
        } else {
          that['pip_dip'].parents().eq(1).css('display', 'none');
          that['lep_cde'].parents().eq(1).css('display', 'none');
          that['pip_dip'].val('default').selectpicker('refresh');
          that['lep_cde'].val('default').selectpicker('refresh');
        }
      });

      that._modalEl.modal('show');
    }

    function onError(err) {
      $.notify({
        message: `[오류] ${err.responseText}`,
      }, { type: 'danger' });
    }
  }

  onFormSubmit(tableAjax) {
    let that = this;

    that.showBlockOverlay(true);
    that._disabledForm.attr('disabled', false);

    that._modalForm.ajaxSubmit({
      url: `${window.location.origin}/service/search?api=editto`,
      method: 'POST',
      headers: { 'CSRF-Token': that._csrfToken },
      success: onUpdateSuccess,
      error: onError,
    }, null, 'json', null);

    function onUpdateSuccess() {
      setTimeout(() => {
        that._modalEl.modal('hide');
        $.notify({
          message: '선택한 민원이 수정되었습니다',
        }, { type: 'success' });
        tableAjax.reload();
      }, 1500);
    }

    function onError(err) {
      that.showBlockOverlay(false);
      $.notify({
        message: `[오류] ${err.responseText}`,
      }, { type: 'danger', element: '#service_edit_form' });
    }
  }

  showBlockOverlay(boolean) {
    if (boolean) {
      this._card.addClass('overlay overlay-block');
      this._cardOverlay.css('display', 'flex');
    } else {
      this._card.removeClass('overlay overlay-block');
      this._cardOverlay.css('display', 'none');
    }
  }
}

class EditModalMap {

  constructor() {
    if (EditModalMap.exists) {
      return EditModalMap.instance;
    }
    EditModalMap.instance = this;
    EditModalMap.exists = true;

    const mapOptions = {
      center: getDefaultCenter(),
      level: 3,
      draggable: true,
      disableDoubleClick: true,
      disableDoubleClickZoom: true,
      scrollwheel: true,
      tileAnimation: false,
    };

    const mapContainer = document.getElementById('search_map_modal');

    this._map = new kakao.maps.Map(mapContainer, mapOptions);

    const mapTypeControl = new kakao.maps.MapTypeControl();
    this._map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPLEFT);
    this._map.setMinLevel(1);
    this._map.setMaxLevel(7);

    let that = this;

    this._marker = new kakao.maps.Marker({
      map: that._map,
      position: that._map.getCenter(),
    });

    kakao.maps.event.addListener(that._map, 'click', that.onKakaoMapClick.bind(that));

    window.addEventListener('resize', onWindowResize.bind(that._map), { passive: true });

    return this;
  }

  start(x, y) {
    const defaultLatLng = new kakao.maps.LatLng(y, x);
    this._map.setLevel(3);
    this._map.setCenter(defaultLatLng);
    this._marker.setPosition(defaultLatLng);
  }

  onKakaoMapClick(event) {
    let latLng = event.latLng;
    this._marker.setPosition(latLng);
    latLngToAddress(latLng).then(response => {
      let address = response['address'];
      let road = response['road_address'];
      let jibun = address['address_name'];
      $('.form-control[name="apm_adr_road"]')
        .val(road !== null ? road['address_name'] : ' ')
        .change();
      $('.form-control[name="apm_adr_jibun"]')
        .val(jibun !== '' ? jibun : ' ')
        .change();

      $('.form-control[name="apl_hjd"]')
        .val(null);

      $('.form-control[name="apl_adr"]')
        .val(address['main_address_no'] + (address['sub_address_no'] === '' ? '' : '-' + address['sub_address_no']));

      $('#service_edit_form input[name="x"]')
        .val(latLng.getLng());

      $('#service_edit_form input[name="y"]')
        .val(latLng.getLat());
    });
  }
}
