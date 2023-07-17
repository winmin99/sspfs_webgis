import { and, between, during, greaterThanOrEqualTo } from 'ol/format/filter';
import { geoJson, wfs } from '../format';
import { property } from '../layer';
import { SearchModal } from '../modal';

/**
 * @link https://openlayers.org/en/latest/apidoc/module-ol_format_filter.html
 */
const FeatureFilter = function () {

  let _vectorLayer;
  let _requestUrl;
  let _requestDefaults;
  let _form1, _form2;
  let _featureTypeMap = new Map();
  let _searchModal;
  let _isActive = false;

  function _init() {
    document.getElementById('btn-search').addEventListener('mousedown', event => {
      event.preventDefault();
      _isActive = !_isActive;
      event.target.classList.toggle('active', _isActive);
      if (_isActive) {
        _searchModal.showModal();
      } else {
        _searchModal.hideModal();
      }
    }, false);

    _requestUrl = `${window.webgis.geoserverHost}/geoserver/${window.webgis.workspace}/wfs`;
    _requestDefaults = {
      featurePrefix: window.webgis.workspace,
      outputFormat: 'application/json',
      srsName: 'EPSG:5187',
    };
  }

  /**
   * Common filter functions
   */

  function _addFeatureType(index, name) {
    _featureTypeMap.set(index, { name: name, filters: [] });
  }

  function _removeFeatureType(index) {
    if (_featureTypeMap.has(index)) {
      const featureTypeName = _featureTypeMap.get(index)['name'];
      _vectorLayer.getLayer(`${featureTypeName}_filter`).getSource().clear();
      _featureTypeMap.delete(index);
    }
  }

  function _addFilter(index, filter) {
    _featureTypeMap.get(index)['filters'].push(filter);
  }

  // eslint-disable-next-line no-unused-vars
  function _removeFilter(index, filterIndex) {
    _featureTypeMap.get(index)['filters'].splice(filterIndex, 1);
  }

  function _joinFilters(filters) {
    return filters.length > 1 ? and(...filters) : filters[0];
  }

  function _executeSearch() {
    const requests = _getRequestMap();
    const requestSerializer = new XMLSerializer();

    requests.forEach((request, featureTypeName) => {
      fetch(_requestUrl, _getRequestInit(request, requestSerializer)).then(response => {
        if (response.ok) return response.json();
        throw new Error(response.statusText);
      }).then(result => {
        _vectorLayer.hideLayers([featureTypeName, 'viw_wtl_cap_ps', 'viw_swl_conn_ls', 'viw_swl_side_ls']);
        _vectorLayer.getLayer(`${featureTypeName}_filter`).getSource().addFeatures(geoJson.readFeatures(result));
      }).catch(error => {
        $.notify({ message: `검색정보를 불러오지 못하였습니다<br>(${error})` },
          { type: 'danger' },
        );
      });
    });
  }

  function _getRequestMap() {
    const requestMap = new Map();
    _featureTypeMap.forEach(featureType => {
      let request = wfs.writeGetFeature({
        ..._requestDefaults,
        featureTypes: [featureType['name']],
        filter: _joinFilters(featureType['filters']),
        propertyNames: property[featureType['name']].propertyName,
      });
      requestMap.set(featureType['name'], request);
    });
    return requestMap;
  }

  function _getRequestInit(request, xmlSerializer) {
    return {
      method: 'POST',
      body: xmlSerializer
        .serializeToString(request)
        .replace('/gml', '/gml/3.2'),
    };
  }

  /**
   * Filter 'VIW_WTL_PIPE_LM' or 'VIW_SWL_PIPE_LM' by column '설치일자'
   */

  function _initPipeSearch() {
    const istYmdFilterMenu = document.getElementById('viw_wtl_pipe_lm_filter_ist_ymd');
    istYmdFilterMenu.querySelectorAll('.navi-item').forEach(element => {
      element.addEventListener('click', _onClickIstYmdFilterMenu, false);
    });
    _form1 = istYmdFilterMenu.querySelector('.form');
    _form1.querySelectorAll('input').forEach(element => {
      $(element).inputmask({
        mask: '9999',
        placeholder: '', // remove underscores from the input mask
      });
    });
    _form1.querySelector('button').addEventListener('click', _onClickIstYmdFilterButton, false);

    const pipDipFilterMenu = document.getElementById('viw_wtl_pipe_lm_filter_pip_dip');
    pipDipFilterMenu.querySelectorAll('.navi-item').forEach(element => {
      element.addEventListener('click', _onClickPipDipFilterMenu, false);
    });
    _form2 = pipDipFilterMenu.querySelector('.form');
    _form2.querySelectorAll('input').forEach(element => {
      $(element).inputmask({
        mask: '9999',
        placeholder: '', // remove underscores from the input mask
      });
    });
    _form2.querySelector('button').addEventListener('click', _onClickPipDipFilterButton, false);
  }

  function _onClickIstYmdFilterMenu(event) {
    event.preventDefault();
    const range = event.target.title;
    switch (range) {
      case '-1': {
        _resetPipeSearch();
        break;
      }
      default: {
        const begin = '1901-01-01';
        const end = moment().subtract(range, 'years').format('YYYY-MM-DD');
        _executePipeSearch(during('설치일자', begin, end));
        break;
      }
    }
  }

  function _onClickPipDipFilterMenu(event) {
    event.preventDefault();
    const range = event.target.title;
    switch (range) {
      case '-1': {
        _resetPipeSearch();
        break;
      }
      default: {
        _executePipeSearch(greaterThanOrEqualTo('구경', range));
        break;
      }
    }
  }

  function _onClickIstYmdFilterButton(event) {
    event.preventDefault();
    let begin = _form1.querySelector('input[name="begin"]').value;
    begin = begin.length === 0 ? '1901-01-01' : `${begin}-01-01`;
    let end = _form1.querySelector('input[name="end"]').value;
    end = end.length === 0 ? moment().format('YYYY-MM-DD') : `${end}-12-31`;
    _executePipeSearch(during('설치일자', begin, end));
  }

  function _onClickPipDipFilterButton(event) {
    event.preventDefault();
    let begin = _form2.querySelector('input[name="begin"]').value;
    begin = begin.length === 0 ? 0 : begin;
    let end = _form2.querySelector('input[name="end"]').value;
    end = end.length === 0 ? 1000 : end;
    _executePipeSearch(between('구경', begin, end));
  }

  function _executePipeSearch(filter) {
    _removeFeatureType(-1);
    _addFeatureType(-1, 'viw_wtl_pipe_lm');
    _addFilter(-1, filter);
    _executeSearch();
  }

  function _resetPipeSearch() {
    _featureTypeMap.forEach((featureType, index) => {
      _vectorLayer.showLayers([featureType['name']]);
      _removeFeatureType(index);
    });
    _vectorLayer.showLayers(['viw_wtl_cap_ps', 'viw_swl_conn_ls', 'viw_swl_side_ls']);
  }

  return {
    init: function (layer) {
      _vectorLayer = layer;
      _searchModal = new SearchModal('#kt_search_modal');

      _init();
      _initPipeSearch();
    },
  };

}();

export default FeatureFilter;
