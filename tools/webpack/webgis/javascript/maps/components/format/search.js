/**
 * @param {String} html representing any number of sibling elements
 * @return {ChildNode}
 */
function htmlToElement(html) {
  let template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstChild;
}

const _resultEl = htmlToElement(`<div class="quick-search-result"></div>`);
const _sectionEl = htmlToElement(`<div class="font-size-lg text-primary font-weight-bolder text-uppercase mb-2"></div>`);
const _itemWrapperEl = htmlToElement(`<div class="mb-4"></div>`);
const _itemEl = htmlToElement(`<div class="d-flex flex-column ml-3 mt-3 mb-3">
    <a href="javascript:;" class="font-weight-bold text-dark text-hover-primary"></a>
    <p hidden></p>
    <span class="font-size-sm font-weight-bold text-muted"></span>
</div>`);

const ROWS = 'rows';
const CNAME = 'cname';
const CNAME_filter = new Set([
  // 상수관로
  '공업용수관',
  '급수관',
  '도수관',
  '배수관',
  '송수관',
  '취수관',
  // 변류시설
  '감압변',
  '배기변',
  '안전변',
  '이토변',
  '제수변',
  '지수전',
  // 급수전
  '급수전',
]);
const COORDINATE = 'coordinate';
const FAC_NAM = 'fac_nam';
const HJD_NAM = 'hjd_nam';
const BJD_NAM = 'bjd_nam';
const FTR_IDN = 'ftr_idn';

function formatFacilitySearch(response) {
  return new Promise(resolve => {
    // Use #clone() to create a new element from the template.
    const resultEl = _resultEl.cloneNode(true);
    const results = response[ROWS];
    if (results.length > 0) {
      // Create an array of unique 'cname' values. Each entry will make a separate section element.
      const categorySet = [...new Set(results.map(result => result[CNAME]))];
      // For each 'cname' category section, read and write each item inside a wrapper element.
      categorySet.forEach(category => {
        const itemWrapperEl = _itemWrapperEl.cloneNode(true);
        // Create an array of items that have the target 'cname' value.
        const items = results.filter(result => result[CNAME] === category);
        items.forEach(item => {
          const itemEl = _itemEl.cloneNode(true);
          let fac_nam;
          if (CNAME_filter.has(item[CNAME])) {
            fac_nam = item[CNAME] + ' ' + item[FTR_IDN];
          } else if (item[FAC_NAM] === '' || item[FAC_NAM] == null || item[FAC_NAM] === 'NULL' || item[FAC_NAM] === 'null') {
            fac_nam = '이름 없음';
          } else {
            fac_nam = item[FAC_NAM];
          }
          let hjd_nam = item[HJD_NAM] == null ? '' : item[HJD_NAM];
          let bjd_nam = item[BJD_NAM] == null ? '' : item[BJD_NAM];
          if (hjd_nam === bjd_nam) bjd_nam = '';
          if (item[FTR_IDN] != null) bjd_nam = bjd_nam + ' ' + `(관리번호: ${item[FTR_IDN]})`;
          itemEl.querySelector('a').classList.add('quick-search-result-facility');
          itemEl.querySelector('a').innerHTML = fac_nam;
          itemEl.querySelector('p').innerHTML = item[COORDINATE];
          itemEl.querySelector('span').innerHTML = hjd_nam + ' ' + bjd_nam;
          itemWrapperEl.appendChild(itemEl);
        });
        // Write the unique 'cname' value as section.
        const sectionEl = _sectionEl.cloneNode(true);
        sectionEl.append(category);
        sectionEl.appendChild(itemWrapperEl);
        // Append each 'cname' section to .quick-search-result element.
        resultEl.appendChild(sectionEl);
      });
      // return the formatted html element as String.
      resolve(resultEl.outerHTML);
    } else {
      const itemEl = _itemEl.cloneNode(true);
      itemEl.querySelector('a').classList.add('text-muted');
      itemEl.querySelector('a').innerHTML = '검색 결과가 없습니다';
      const itemWrapperEl = _itemWrapperEl.cloneNode(true);
      itemWrapperEl.appendChild(itemEl);
      const sectionEl = _sectionEl.cloneNode(true);
      sectionEl.appendChild(itemWrapperEl);
      resultEl.appendChild(sectionEl);
      resolve(resultEl.outerHTML);
    }
  });
}

// const STATUS_OK = kakao.maps.services.Status.OK;
// const STATUS_ZERO_RESULT = kakao.maps.services.Status.ZERO_RESULT;
// const STATUS_ERROR = kakao.maps.services.Status.ERROR;

let resultEl;

function formatAddressSearch(results) {
  return new Promise((resolve, reject) => {
    resultEl = _resultEl.cloneNode(true);
    const itemWrapperEl = _itemWrapperEl.cloneNode(true);
    const sectionEl = _sectionEl.cloneNode(true);
    sectionEl.append('주소');
    if (results['meta']['total_count'] > 0) {
      const items = results['documents'];
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#description
      const sortedItems = items.filter(element => element['address_name'].includes(window.webgis.workspaceLocale));
      for (const item of sortedItems) {
        let address, address_alt, building;
        if (item['address_type'].match(/(REGION)/)) {
          address = item['address_name'];
          address_alt = '';
          building = '';
        } else if (item['address_type'].match(/(ROAD)/)) {
          address = item['address_name'];
          address_alt = item['address'] == null
            ? ''
            : item['address']['address_name'];
          building = item['road_address']['building_name'] == null
            ? ''
            : `${item['road_address']['building_name']}`;
        } else {
          continue;
        }
        const itemEl = _itemEl.cloneNode(true);
        itemEl.querySelector('a').classList.add('quick-search-result-address', 'quick-search-result-road');
        itemEl.querySelector('a').innerHTML = address;
        itemEl.querySelector('p').innerHTML = item['x'] + ',' + item['y'];
        itemEl.querySelector('span').innerHTML = `${address_alt} ${building}`;
        itemWrapperEl.appendChild(itemEl);
      }
      sectionEl.appendChild(itemWrapperEl);
      resultEl.appendChild(sectionEl);
      resolve();
    } else if (results['meta']['total_count'] === 0) {
      const itemEl = _itemEl.cloneNode(true);
      itemEl.querySelector('a').classList.add('text-muted');
      itemEl.querySelector('a').innerHTML = '검색 결과가 없습니다';
      itemWrapperEl.appendChild(itemEl);
      sectionEl.appendChild(itemWrapperEl);
      resultEl.appendChild(sectionEl);
      resolve();
    } else {
      reject();
    }
  });
}

function formatKeywordSearch(results) {
  return new Promise((resolve, reject) => {
    const itemWrapperEl = _itemWrapperEl.cloneNode(true);
    const sectionEl = _sectionEl.cloneNode(true);
    sectionEl.append('장소');
    if (results['meta']['total_count'] > 0) {
      const items = results['documents'];
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#description
      const sortedItems = items.filter(element => element['address_name'].includes(window.webgis.workspaceLocale));
      for (const item of sortedItems) {
        const itemEl = _itemEl.cloneNode(true);
        itemEl.querySelector('a').classList.add('quick-search-result-address', 'quick-search-result-place');
        itemEl.querySelector('a').innerHTML = item['place_name'];
        itemEl.querySelector('p').innerHTML = item['x'] + ',' + item['y'];
        itemEl.querySelector('span').innerHTML =
          item['road_address_name'] === ''
            ? item['address_name']
            : item['road_address_name'];
        itemWrapperEl.appendChild(itemEl);
      }
      sectionEl.appendChild(itemWrapperEl);
      resultEl.appendChild(sectionEl);
      resolve(resultEl.outerHTML);
    } else if (results['meta']['total_count'] === 0) {
      const itemEl = _itemEl.cloneNode(true);
      itemEl.querySelector('a').classList.add('text-muted');
      itemEl.querySelector('a').innerHTML = '검색 결과가 없습니다';
      itemWrapperEl.appendChild(itemEl);
      sectionEl.appendChild(itemWrapperEl);
      resultEl.appendChild(sectionEl);
      resolve(resultEl.outerHTML);
    } else {
      reject();
    }
  });
}

// Webpack support
if (typeof module !== 'undefined') {
  module.exports = { formatFacilitySearch, formatAddressSearch, formatKeywordSearch };
}
