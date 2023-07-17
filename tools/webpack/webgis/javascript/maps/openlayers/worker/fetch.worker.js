let messageData;

self.onmessage = message => {
  messageData = message.data;
  fetch(messageData['URL'],
    {
      mode: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': messageData['CSRF-Token'],
      },
    })
    .then(resolveResponse)
    .then(resolveContentByType)
    .then(result => self.postMessage(result))
    .catch(err => self.postMessage(err))
    .finally(() => {
      messageData = null;
    });
};

function resolveResponse(response) {
  if (!response.ok) throw new Error(response.statusText);
  return response.json();
}

function resolveContentByType(response) {
  switch (messageData['Mime-Type']) {
    case 'image/jpg':
      return createImageBlobUrl(response);
    default:
      return response;
  }

  function createImageBlobUrl(response) {
    for (let i = 0, len = response.length; i < len; i++) {
      if (!response[i]['사진']) continue;
      const buffer = response[i]['사진'].data;
      const uint8Array = new Uint8Array(buffer);
      const blob = new Blob([uint8Array], { type: messageData['Mime-Type'] });
      response[i]['사진'] = URL.createObjectURL(blob);
    }
    return response;
  }
}
