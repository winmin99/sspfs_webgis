/**
 * @param {String} html representing any number of sibling elements
 * @return {ChildNode}
 */
const { LocalStorage } = require('../../maps/Storage');
const localStorage = new LocalStorage();

function htmlToElement(html) {
  let template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstChild;
}

const _itemEl = htmlToElement(`<option value=""></option>`);

const OPR_NAM = 'PRD_NAM';

function formatSchedule(response) {
  response = response ? response : localStorage.get(OPR_NAM);
  return new Promise(resolve => {
    let localStorageArray = [];
    let optionHTML = '<option value="" hidden></option>';
    for (let i = 0; i < response.length; i++) {
      let result = response[i];
      const itemEl = _itemEl.cloneNode(true);
      itemEl.value = result[OPR_NAM];
      itemEl.innerHTML = result[OPR_NAM];
      optionHTML = optionHTML + itemEl.outerHTML;
      localStorageArray.push({ 'PRD_NAM': result[OPR_NAM] });
    }
    localStorage.set(OPR_NAM, localStorageArray);
    resolve(optionHTML);
  });
}

// Webpack support
if (typeof module !== 'undefined') {
  module.exports = { formatSchedule };
}
