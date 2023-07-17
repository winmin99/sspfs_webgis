import SourceLoader from '../worker/sourceLoader.worker';

export default function loadSource(source, url, extent, success, failure) {
  const sourceLoader = new SourceLoader();
  sourceLoader.postMessage(url);
  sourceLoader.onerror = error => {
    source.removeLoadedExtent(extent);
    failure();
  };
  sourceLoader.onmessage = response => {
    (async () => {
      const features = source.getFormat().readFeatures(response.data);
      source.addFeatures(features);
      success(features);
    })()
      .catch(() => {
        // TODO: Error Handling
      })
      .finally(() => {
        sourceLoader.terminate();
      });
  };
}
