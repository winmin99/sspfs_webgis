import { fromLonLat } from 'ol/proj';
import { coordinateToLatLng } from './util';
import projection from '../openlayers/projection';

// const geoCoder = new kakao.maps.services.Geocoder();

function coordinateToAddress(coordinate) {
  return new Promise((resolve, reject) => {
    coordinateToLatLng(coordinate)
      .then(latLngToAddress)
      .then(addressToHtml)
      .then(content => {
        resolve(content);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function latLngToAddress(latLng) {
  return new Promise((resolve) => {
    // geoCoder.coord2Address(latLng.getLng(), latLng.getLat(), (res, status) => {
    //   if (status === kakao.maps.services.Status.OK) {
    //     resolve(res[0]);
    //   }
    // });
    let latLngRound = { x: latLng.getLng().toFixed(6), y: latLng.getLat().toFixed(6) };
    let coordinate = fromLonLat([latLng.getLng(), latLng.getLat()], projection);
    let coordinateRound = { x: coordinate[0].toFixed(3), y: coordinate[1].toFixed(3) };
    $.ajax({
      url: 'https://dapi.kakao.com/v2/local/geo/coord2address.json',
      headers: {
        'Authorization': `KakaoAK ${window.webgis.kakao.rest}`,
      },
      data: latLngRound,
      dataType: 'json',
      success: function (res) {
        resolve({
          address: res['documents'][0],
          coordinate: coordinateRound,
          latLng: latLngRound,
        });
      },
    });
  });
}

function addressToHtml(result) {
  return new Promise((resolve) => {
    const { address, coordinate, latLng } = result;
    const htmlContent = [];
    if (address['road_address'] != null) {
      htmlContent.push(
        `도로명 주소: <a href="#" class="addr-clipboard">${address['road_address']['address_name']}</a>`,
      );
    }
    if (address['address']['address_name'] != null) {
      htmlContent.push(
        `지&nbsp;&nbsp;&nbsp;번 주소: <a href="#" class="addr-clipboard">${address['address']['address_name']}</a>`,
      );
    }
    if (latLng != null) {
      htmlContent.push(
        `경위도 좌표: <a href="#" class="addr-clipboard text-warning">${latLng['x']} ${latLng['y']}</a>`,
      );
    }
    if (latLng != null) {
      htmlContent.push(
        `T&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;M 좌표: <a href="#" class="addr-clipboard text-success">${coordinate['x']} ${coordinate['y']}</a>`,
      );
    }
    resolve(htmlContent.join('<br />'));
  });
}

export {
  coordinateToAddress,
  latLngToAddress,
};
