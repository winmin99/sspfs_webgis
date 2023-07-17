/**
 * @link http://apis.map.kakao.com/web/sample/moveRoadview/
 */
class RoadViewWalker {
  constructor(position) {

    //커스텀 오버레이에 사용할 map walker 엘리먼트
    let content = document.createElement('div');
    let figure = document.createElement('div');
    let angleBack = document.createElement('div');

    //map walker를 구성하는 각 노드들의 class명을 지정 - style셋팅을 위해 필요
    content.className = 'MapWalker';
    figure.className = 'figure';
    angleBack.className = 'angleBack';

    content.appendChild(angleBack);
    content.appendChild(figure);

    //커스텀 오버레이 객체를 사용하여, map walker 아이콘을 생성
    this._walker = new kakao.maps.CustomOverlay({
      position: position,
      content: content,
      yAnchor: 1,
    });

    this._content = content;
  }

  setAngle(angle) {
    const threshold = 22.5; //이미지가 변화되어야 되는(각도가 변해야되는) 임계 값
    for (let i = 0; i < 16; i++) {
      //각도에 따라 변화되는 앵글 이미지의 수가 16개
      if (angle > threshold * i && angle < threshold * (i + 1)) {
        //각도(pan)에 따라 아이콘의 class명을 변경
        let className = 'm' + i;
        this._content.className = this._content.className.split(' ')[0];
        this._content.className += ' ' + className;
        break;
      }
    }
  }

  setPosition(position) {
    this._walker.setPosition(position);
  }

  getMap() {
    return this._walker.getMap();
  }

  setMap(map) {
    this._walker.setMap(map);
  }
}

const roadViewWalker = new RoadViewWalker(null);

export default roadViewWalker;
