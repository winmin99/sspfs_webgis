import { default as projection } from '../projection';
import { fileNameFilter } from '../filter';
import JSZip from 'jszip';

export default class FileExport {

  constructor(options = {}) {
    this._map = options['map'];
    this._view = options['view'];
    this._vectorLayer = options['vectorLayer'];

    this._onClickElement = undefined;
    this._intervalId = undefined;

    this._host = `${window.webgis.geoserverHost}/geoserver/${window.webgis.workspace}/ows`;
    this._params = {
      exceptions: 'application/json',
      format_options: 'CHARSET:x-windows-949',
      request: 'GetFeature',
      service: 'WFS',
      srsName: projection.getCode(),
      version: '2.0.0',
    };

    document.querySelectorAll('.ol-table-code-export-wfs').forEach(element => {
      element.addEventListener('click', async event => {
        const target = event.target;
        this._onClickElement = target;
        const fileName = target.getAttribute('data-target'); // 상수관로
        const typeName = target.getAttribute('id'); // yeongju_a:viw_wtl_pipe_lm
        const layerName = typeName.split(':')[1]; // viw_wtl_pipe_lm
        const hasFeature = this._vectorLayer.getLayer(layerName).getSource().getFeaturesInExtent(this.extent).length > 0;
        if (!hasFeature) {
          $.notify({
            message: `현재 화면 범위 내에는 "${fileName}" 이(가) 없습니다.<br>일부 시설물은 지도를 확대 후 생성됩니다.`,
          }, { type: 'info' });
          return;
        }
        target.classList.remove('text-success', 'text-warning');
        target.classList.add('text-danger');
        target.style.pointerEvents = 'none';
        await this.exportShapefile(typeName, fileName);
      });
    });

    document.querySelectorAll('.ol-table-code-export-wms').forEach(element => {
      element.addEventListener('click', async event => {
        const target = event.target;
        this._onClickElement = target;
        const fileName = target.getAttribute('data-target');
        const typeName = target.getAttribute('id');
        target.classList.remove('text-success', 'text-warning');
        target.classList.add('text-danger');
        target.style.pointerEvents = 'none';
        await this.exportShapefile(typeName, fileName);
      });
    });
  }

  get extent() {
    return this._view.calculateExtent(this._map.getSize());
  }

  get bbox() {
    return `${this.extent.join(',')},${projection.getCode()}`;
  }

  async exportShapefile(typeName, fileName) {
    const params = {
      ...this._params,
      bbox: this.bbox,
      outputFormat: 'SHAPE-ZIP', // 반드시 전체 대문자로 지정
      // propertyName: [
      //   'geom',
      //   '레이어',
      //   '관리번호',
      // ],
      typeName,
    };
    await this._runExport(params, fileName);
  }

  async exportDxf(typeName, fileName) {
    const params = {
      ...this._params,
      bbox: this.bbox,
      outputFormat: 'DXF-ZIP', // 반드시 전체 대문자로 지정
      typeName,
    };
    await this._runExport(params, fileName);
  }

  async _runExport(params, fileName) {
    try {
      const response = await fetch(this._host, {
        method: 'POST',
        body: new URLSearchParams(params),
      });
      if (response.ok) {
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);
        const newZip = new JSZip();
        // Define a function to rename the file
        const renameFile = async (oldFile) => {
          const extensionIndex = oldFile.name.lastIndexOf('.');
          const oldName = oldFile.name.substring(0, extensionIndex);
          // Define new name based on the old file's extension
          const newName = fileNameFilter.get(oldName) + oldFile.name.substring(extensionIndex);
          // Read the old file's content
          const content = await oldFile.async('arraybuffer');
          // Add the old file's content to the new file with the new name
          newZip.file(newName, content);
        };
        // Create an array of promises
        let promises = [];
        zip.forEach((relativePath, zipEntry) => {
          if (!zipEntry.dir) {
            // Rename each file
            promises.push(renameFile(zipEntry));
          }
        });
        // Wait for all files to be renamed
        await Promise.all(promises);
        // Generate new blob
        const content = await newZip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${moment().format('YYMMDD')}_${fileName}.zip`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        const error = await response.json();
        console.error(error['exceptions'][0]['text']);
      }
    } catch (error) {
      console.error(error);
    } finally {
      const target = this._onClickElement;
      target.classList.add('text-warning');
      target.classList.remove('text-danger');
      target.style.pointerEvents = 'auto';
      if (this._intervalId) clearInterval(this._intervalId);
      // Start a new interval
      this._intervalId = setInterval(() => this._view.dispatchEvent('change:center'), 500);
      setTimeout(() => {
        // Start the timeout after which the interval will be stopped
        clearInterval(this._intervalId);
        this._intervalId = undefined; // Reset the interval ID variable
      }, 60000);
    }
  }
}
