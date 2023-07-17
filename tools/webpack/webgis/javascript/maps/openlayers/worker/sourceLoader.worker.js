self.onmessage = message => {
  fetch(message.data)
    .then(response => {
      if (response.ok) return response.text();
    })
    .then(result => self.postMessage(result));
};
