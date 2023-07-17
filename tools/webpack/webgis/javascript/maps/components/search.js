const { formatFacilitySearch, formatAddressSearch, formatKeywordSearch } = require('./format/search');

const KTLayoutSearch = function () {
  // Private properties
  let _target;
  let _form;
  let _input;
  let _closeIcon;
  let _resultWrapper;
  let _resultDropdown;
  let _resultDropdownToggle;
  let _closeIconContainer;
  let _query = '';

  let _hasResult = false;
  let _hasSingleResultEvent = new CustomEvent('singleresult', null);
  let _timeout = false;
  let _isProcessing = false;
  let _requestTimeout = 500; // ajax request fire timeout in milliseconds
  let _spinnerClass = 'spinner spinner-sm spinner-primary';
  let _resultClass = 'quick-search-has-result';
  let _minLength = 2;

  let _toggle;
  let _toggleIndex = 0;
  let _toggleArray = [
    {
      class: 'label-info',
      url: `https://dapi.kakao.com/v2/local/search/keyword.json?rect=${window.webgis.rect}`, // Not Used
      headers: {
        'Authorization': `KakaoAK ${window.webgis.kakao.rest}`,
      },
      format: formatAddressSearch,
      formatTwo: formatKeywordSearch,
    },
    {
      class: 'label-primary',
      url: `${window.location.origin}/api/wtl/search`,
      headers: {
        'CSRF-Token': $('meta[name=\'csrf-token\']').attr('content'),
      },
      format: formatFacilitySearch,
      formatTwo: null,
    },
    // Reserved for SWL search
    // {
    //   class: 'label-danger',
    //   url: `${window.location.origin}/api/wtl/search`,
    //   headers: {
    //     'CSRF-Token': $("meta[name='csrf-token']").attr('content'),
    //   },
    //   format: formatFacilitySearch,
    //   formatTwo: null,
    // },
  ];
  // const placeSearch = new kakao.maps.services.Places();
  // const geoCoder = new kakao.maps.services.Geocoder();

  // Private functions
  const _showProgress = function () {
    _isProcessing = true;
    KTUtil.addClass(_closeIconContainer, _spinnerClass);

    if (_closeIcon) {
      KTUtil.hide(_closeIcon);
    }
  };

  const _hideProgress = function () {
    _isProcessing = false;
    KTUtil.removeClass(_closeIconContainer, _spinnerClass);

    if (_closeIcon) {
      if (_input.value.length < _minLength) {
        KTUtil.hide(_closeIcon);
      } else {
        KTUtil.show(_closeIcon, 'flex');
      }
    }
  };

  const _showDropdown = function () {
    if (_resultDropdownToggle && !KTUtil.hasClass(_resultDropdown, 'show')) {
      $(_resultDropdownToggle).dropdown('toggle');
      $(_resultDropdownToggle).dropdown('update');
    }
  };

  const _hideDropdown = function () {
    if (_resultDropdownToggle && KTUtil.hasClass(_resultDropdown, 'show')) {
      $(_resultDropdownToggle).dropdown('toggle');
    }
  };

  const _processSearch = function () {
    if (_hasResult && _query === _input.value) {
      _hideProgress();
      KTUtil.addClass(_target, _resultClass);
      _showDropdown();
      KTUtil.scrollUpdate(_resultWrapper);

      return;
    }

    _query = _input.value;

    KTUtil.removeClass(_target, _resultClass);
    _showProgress();
    _hideDropdown();

    setTimeout(() => {
      if (_toggleIndex > 0) { // Is either WTL or SWL search
        if (_query === '') {
          _hideProgress();
          _handleCancel();
          return;
        }
        $.ajax({
          url: _toggleArray[_toggleIndex].url,
          headers: _toggleArray[_toggleIndex].headers,
          data: {
            query: _query,
          },
          dataType: 'json',
          success: function (res) {
            _hasResult = true;
            _hideProgress();
            _toggleArray[_toggleIndex].format(res)
              .then(result => {
                KTUtil.addClass(_target, _resultClass);
                KTUtil.setHTML(_resultWrapper, result);
                _showDropdown();
                KTUtil.scrollUpdate(_resultWrapper);
              });
          },
          error: _handleError,
        });
      } else { // Is address & places search
        _searchAddress().then(_searchPlaces)
          .then(result => {
            _hasResult = true;
            _hideProgress();
            KTUtil.addClass(_target, _resultClass);
            KTUtil.setHTML(_resultWrapper, result);
            const placeCount = (result.match(/quick-search-result-place/g) || []).length;
            const addressCount = (result.match(/quick-search-result-road/g) || []).length;
            if (placeCount === 1 || addressCount === 1) {
              document.dispatchEvent(_hasSingleResultEvent);
            } else {
              _showDropdown();
            }
            KTUtil.scrollUpdate(_resultWrapper);
          })
          .catch(_handleError);
      }
    }, 200);
  };

  const _searchAddress = function () {
    return new Promise((resolve, reject) => {
      _hideProgress();
      $.ajax({
        url: 'https://dapi.kakao.com/v2/local/search/address.json',
        headers: _toggleArray[_toggleIndex].headers,
        data: {
          query: _query,
        },
        dataType: 'json',
        success: function (res) {
          _toggleArray[_toggleIndex]
            .format(res)
            .then(() => resolve())
            .catch(() => reject());
        },
      });
      // geoCoder.addressSearch(_query, (results, status) => {
      //   _toggleArray[_toggleIndex]
      //     .format(results, status)
      //     .then(() => resolve())
      //     .catch(() => reject());
      // });
    });
  };

  const _searchPlaces = function () {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: 'https://dapi.kakao.com/v2/local/search/keyword.json',
        headers: _toggleArray[_toggleIndex].headers,
        data: {
          query: _query,
          rect: window.webgis.rect,
        },
        dataType: 'json',
        success: function (res) {
          _toggleArray[_toggleIndex]
            .formatTwo(res)
            .then(result => resolve(result))
            .catch(() => reject());
        },
      });
      // placeSearch.keywordSearch(_query, (results, status, pagination) => {
      //   _toggleArray[_toggleIndex]
      //     .formatTwo(results, status, pagination)
      //     .then(result => resolve(result))
      //     .catch(() => reject());
      // }, {
      //   rect: window.webgis.rect,
      // });
    });
  };

  const _handleCancel = function (e) {
    _input.value = '';
    _query = '';
    _hasResult = false;
    KTUtil.hide(_closeIcon);
    KTUtil.removeClass(_target, _resultClass);
    _hideDropdown();
  };

  const _handleError = function (e) {
    _hasResult = false;
    _hideProgress();
    KTUtil.addClass(_target, _resultClass);
    KTUtil.setHTML(_resultWrapper, `<span class="font-weight-bold">(Error) ${e.statusText} ${e.responseJSON['code']}</span>`);
    _showDropdown();
    KTUtil.scrollUpdate(_resultWrapper);
  };

  const _handleSearch = function () {
    // Set minimum length of 'ftr_idn' search value to 1, otherwise 2
    _minLength = _input.value.match('^[0-9]+$') ? 1 : 2;

    if (_input.value.length < _minLength) {
      _hideProgress();
      _hideDropdown();

      return;
    }

    if (_isProcessing === true) {
      return;
    }

    if (_timeout) {
      clearTimeout(_timeout);
    }

    _timeout = setTimeout(function () {
      _processSearch();
    }, _requestTimeout);
  };

  const _handleSearchToggle = function () {
    if (document.getElementById('card_register')
      || document.getElementById('card_search')) {
      return;
    }
    _input.value = null;
    _toggle.classList.replace(
      _toggleArray[_toggleIndex++ % _toggleArray.length].class,
      _toggleArray[_toggleIndex % _toggleArray.length].class,
    );
    _toggleIndex = _toggleIndex % _toggleArray.length;
  };

  // Public methods
  return {
    init: function (id) {
      _target = KTUtil.getById(id);

      if (!_target) {
        return;
      }

      _form = KTUtil.find(_target, '.quick-search-form');
      _input = KTUtil.find(_target, '.form-control');
      _closeIcon = KTUtil.find(_target, '.quick-search-close');
      _resultWrapper = KTUtil.find(_target, '.quick-search-wrapper');
      _resultDropdown = KTUtil.find(_target, '.dropdown-menu');
      _resultDropdownToggle = KTUtil.find(_target, '[data-toggle="dropdown"]');
      _closeIconContainer = KTUtil.find(_target, '.input-group .input-group-append');
      _toggle = KTUtil.find(_target, '.input-group-prepend .input-group-text a[data-toggle="tooltip"]');

      // Attach input keyup handler
      KTUtil.addEvent(_input, 'keyup', _handleSearch);
      KTUtil.addEvent(_input, 'focus', _handleSearch);

      // Prevent enter click
      _form.onkeypress = function (e) {
        let key = e.charCode || e.keyCode || 0;
        if (key === 13) {
          e.preventDefault();
        }
      };

      KTUtil.addEvent(_toggle, 'click', _handleSearchToggle);
      KTUtil.addEvent(_closeIcon, 'click', _handleCancel);
    },
  };
};

// Webpack support
if (typeof module !== 'undefined') {
  module.exports = KTLayoutSearch;
}
