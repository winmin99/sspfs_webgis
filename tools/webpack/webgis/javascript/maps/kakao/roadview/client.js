const roadViewContainer = document.getElementById('map-roadview');

const roadView = new kakao.maps.Roadview(roadViewContainer);

const roadViewClient = new kakao.maps.RoadviewClient(); // 좌표로부터 로드뷰 파노 ID 를 가져올 로드뷰 helper 객체

export {
  roadView,
  roadViewClient,
};
