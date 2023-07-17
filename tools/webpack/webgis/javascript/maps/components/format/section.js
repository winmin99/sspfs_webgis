/**
 * @param {String} html representing any number of sibling elements
 * @return {ChildNode}
 */
function htmlToElement(html) {
  let template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstChild;
}

const _resultEl = htmlToElement(`<ul class="navi navi-hover navi-active navi-accent py-5"></ul>`);
const _itemEl = htmlToElement(`<li class="navi-item">
  <a href="javascript:;" class="navi-link navi-text"></a>
</li><div class="separator separator-dashed my-1"></div>`);
// const _separatorEl = htmlToElement('<div class="separator separator-dashed my-0"></div>');

const ROWS = 'rows';
const TABLE = 'table';
const COLUMN = 'column';
const SECTION = 'section';

function formatSectionSelect(response) {
  return new Promise(resolve => {
    const resultEl = _resultEl.cloneNode(true);
    const results = response[ROWS];
    results.forEach(item => {
      const itemEl = _itemEl.cloneNode(true);
      itemEl.querySelector('a').id = item[TABLE] + ':' + item[COLUMN] + ':' + item[SECTION];
      itemEl.querySelector('a').innerHTML = item[SECTION];
      resultEl.appendChild(itemEl);
    });
    resolve(resultEl.outerHTML);
  });
}

// Webpack support
if (typeof module !== 'undefined') {
  module.exports = { formatSectionSearch: formatSectionSelect };
}
