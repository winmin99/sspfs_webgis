import { coordinateToLatLng } from './util';

const service = naver.maps.Service;

function searchCoordinateToAddress(coordinate) {
  return new Promise((resolve, reject) => {
    coordinateToLatLng(coordinate)
      .then(getAddressFromLatLng)
      .then(getAddressHtmlElement)
      .then(content => {
        resolve(content);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function getAddressFromLatLng(latLng) {
  return new Promise((resolve) => {
    service.reverseGeocode({ coords: latLng, orders: 'addr,roadaddr' }, (status, res) => {
      if (status === naver.maps.Service.Status.OK) {
        resolve(res['v2']);
      }
    });
  });
}

function getAddressHtmlElement(address) {
  return new Promise(resolve => {
    const htmlContent = [];
    if (address['roadAddress'] != null) {
      htmlContent.push(
        `도로명 주소: <a href="javascript:;" class="addr-clipboard">${address['roadAddress']}</a>`,
      );
    }
    if (address['jibunAddress'] != null) {
      htmlContent.push(
        `지&nbsp;&nbsp;&nbsp;번 주소: <a href="javascript:;" class="addr-clipboard">${address['jibunAddress']}</a>`,
      );
    }
    resolve(htmlContent.join('<br />'));
  });
}

export {
  searchCoordinateToAddress, getAddressFromLatLng,
};
