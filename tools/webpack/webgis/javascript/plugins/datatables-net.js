function escapeText(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function createSpanEllipsis(data, shortenedData) {
  return `<span title="${escapeText(data)}" class="ellipsis">${shortenedData}&#8230;</span>`;
}

function createAnchor(data, row) {
  return `<a title="${escapeText(data)}" href="/data/storage/download?id=${row['관리번호']}">${data}</a>`;
}

function createAnchorEllipsis(data, shortenedData, row) {
  return `<a title="${escapeText(data)}" href="/data/storage/download?id=${row['관리번호']}" class="ellipsis">${shortenedData}&#8230;</a>`;
}

/**
 * Handle datatables.net table errors by listening to 'error.dt' event, suppressing alert window from popping up
 * @link https://datatables.net/reference/event/error
 */
$.fn.dataTable.ext.errMode = 'none';

$.fn.dataTable.render.ellipsis = function (cutoff, wordbreak, escapeHtml) {
  return function (d, type, row) {
    // Order, search and type get the original data
    if (type !== 'display') {
      return d;
    }

    if (typeof d !== 'number' && typeof d !== 'string') {
      return d;
    }

    d = d.toString(); // cast numbers

    if (d.length <= cutoff) {
      return d;
    }

    let shortened = d.substr(0, cutoff - 1);

    // Find the last white space character in the string
    if (wordbreak) {
      shortened = shortened.replace(/\s([^\s]*)$/, '');
    }

    // Protect against uncontrolled HTML input
    if (escapeHtml) {
      shortened = escapeText(shortened);
    }

    return createSpanEllipsis(d, shortened);
  };
};

$.fn.dataTable.render.ellipsisWithAnchor = function (cutoff, wordbreak, escapeHtml) {
  return function (d, type, row) {
    // Order, search and type get the original data
    if (type !== 'display') {
      return d;
    }

    if (typeof d !== 'number' && typeof d !== 'string') {
      return d;
    }

    d = d.toString(); // cast numbers

    if (d.length <= cutoff) {
      return createAnchor(d, row);
    }

    let shortened = d.substr(0, cutoff - 1);

    // Find the last white space character in the string
    if (wordbreak) {
      shortened = shortened.replace(/\s([^\s]*)$/, '');
    }

    // Protect against uncontrolled HTML input
    if (escapeHtml) {
      shortened = escapeText(shortened);
    }

    return createAnchorEllipsis(d, shortened, row);
  };
};

$.datepicker.setDefaults({
  autoSize: true,
  changeMonth: true,
  changeYear: true,
});
