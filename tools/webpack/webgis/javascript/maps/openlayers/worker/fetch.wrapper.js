import FetchWorker from './fetch.worker';

class FetchWorkerWrapper {

  constructor() {
    this._worker = new FetchWorker();
    this._fetchUrl = '';
    this._urlSearchParams = new URLSearchParams();
    this._mimeType = 'text/plain';
    this._csrfToken = document
      .querySelector('meta[name="csrf-token"]')
      .getAttribute('content');
  }

  fetch(url, params, opt_type) {
    return this
      .setUrlSearchParams(params)
      .setFetchUrl(url)
      .setContentType(opt_type)
      .setWorker(this._worker)
      .catch(err => $.notify({ message: `정보를 불러오지 못하였습니다<br>(${err})` }, { type: 'danger' }))
      .finally(() => this.clear());
  }

  setUrlSearchParams(object) {
    if (!object) return this;
    for (const [key, value] of Object.entries(object)) {
      this._urlSearchParams.set(key, value);
    }
    return this;
  }

  setContentType(type) {
    if (!type) return this;
    this._mimeType = type;
    return this;
  }

  setFetchUrl(url) {
    this._fetchUrl = `${window.location.origin}/api/${url}?${this._urlSearchParams}`;
    return this;
  }

  setWorker(worker) {
    const fetchUrl = this._fetchUrl;
    const csrfToken = this._csrfToken;
    const mimeType = this._mimeType;
    return new Promise(function (resolve, reject) {
      worker.postMessage({
        'URL': fetchUrl,
        'CSRF-Token': csrfToken,
        'Mime-Type': mimeType,
      });
      worker.onmessage = function (message) {
        const result = message.data;
        if (!result || result instanceof Error) {
          reject(result);
          return;
        }
        resolve(result.rowCount ? result.rows : result);
      };
      worker.onerror = function (error) {
        reject(error);
      };
    });
  }

  clear() {
    for (let [key] of this._urlSearchParams.entries()) {
      this._urlSearchParams.delete(key);
    }
  }
}

export default new FetchWorkerWrapper();
