import { selectInteraction } from "../map";

document.addEventListener("DOMContentLoaded", function () {
  // HTML 문서가 완전히 로드되면 실행됨
  // 'photosave'라는 ID를 가진 버튼 요소 가져오기
  const button = document.getElementById("photosave");// 'photosave' ID를 가진 버튼 요소 가져오기
  if (!button) return;// 버튼이 없으면 코드 실행 중단

  // 버튼 클릭 시 photoSave 함수 실행
  button.addEventListener("click", photoSave); // 버튼 클릭 시 photoSave 함수 실행
});

// 📌 사진 저장 기능을 처리하는 함수
export function photoSave() {
  console.log("📌 [photoSave] Button clicked!");

  // 지도에서 사용자가 선택한 객체(feature) 가져오기
  const selectedFeatures = selectInteraction.getFeatures();
  console.log(selectedFeatures.getArray(), "Too bed");

  // 선택한 객체에서 '관리번호'와 '레이어' 값 가져오기
  const fac_num = selectedFeatures.item(0)?.get("관리번호");
  const fac_nam = selectedFeatures.item(0)?.get("레이어");
  console.log(`📌 현재 선택된 관리번호: ${fac_num}`);

  // 시설물이 선택되지 않았다면 경고창 띄우고 종료
  if (!fac_num || !fac_nam) {
    showCustomAlert("시설물이 선택되지 않았습니다.", "success");
    return;
  }

  // 📌모달(팝업창) 생성
  const modal = document.createElement("div");
  modal.style.cssText = "display:none;position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);background:white;padding:20px;box-shadow:0 0 10px rgba(0,0,0,0.3);z-index:1000;width:730px;max-height:90vh;overflow-y:auto;border-radius:7px;";
  document.body.appendChild(modal);

  // 닫기 버튼 생성
  const closeButton = document.createElement("button");
  closeButton.textContent = "닫기";
  closeButton.style.cssText = "margin-top:-6px;margin-left:644px;padding:5px 10px;background:red;color:white;border:none;cursor:pointer;";
  modal.appendChild(closeButton);

  // 모달 설명 텍스트 추가
  const modalText = document.createElement("p");
  modalText.textContent = "사진을 업로드하고 저장하세요.";
  modalText.style.cssText = "margin-top:-24px;font-weight:bolder;font-size:15px;"
  modal.appendChild(modalText);

  // 📌 업로드 미리보기 영역 추가
  const uploadPreviewContainer = document.createElement("div");
  uploadPreviewContainer.style.cssText = "border: 2px dashed #ccc; padding: 10px; margin-top: 10px;";
  modal.appendChild(uploadPreviewContainer);

  const uploadTitle = document.createElement("p");
  uploadTitle.textContent = "📌 업로드할 사진";
  uploadTitle.style.cssText = "font-weight: bold; color: #d9534f;";
  uploadPreviewContainer.appendChild(uploadTitle);

  const uploadImageContainer = document.createElement("div");
  uploadImageContainer.style.display = "flex";
  uploadImageContainer.style.alignItems = "center";
  uploadPreviewContainer.appendChild(uploadImageContainer);

  // 파일 입력(input) 요소 생성 (이미지 업로드용)
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*"; // 이미지 파일만 선택 가능하도록 제한
  fileInput.style.marginTop = "-3px";
  modal.appendChild(fileInput);

  // 사진 메모 입력창 생성
  const commentInput = document.createElement("input");
  commentInput.type = "text";
  commentInput.placeholder = "추가한 사진에 대한 메모를 입력하세요.";
  commentInput.style.cssText = "margin-top:16px;width:100%;outline:none;border-radius:2px;"
  modal.appendChild(commentInput);

  // 저장 버튼 생성
  const saveButton = document.createElement("button");
  saveButton.textContent = "저장";
  saveButton.style.cssText = "margin-top:10px;padding:5px 10px;background:green;color:white;border:none;cursor:pointer;";
  modal.appendChild(saveButton);

  // 업로드된 이미지 목록을 표시할 컨테이너 생성
  const imageContainer = document.createElement("div");
  imageContainer.style.marginTop = "10px";
  modal.appendChild(imageContainer);

  let uploadedFile = null; // 업로드된 파일을 저장할 변수

  // 📌 파일이 선택되었을 때 실행되는 이벤트 리스너
  fileInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      uploadedFile = file;

      const reader = new FileReader();
      reader.onload = function (e) {
        uploadImageContainer.innerHTML = "";

        const previewWrapper = document.createElement("div");
        previewWrapper.style.cssText = "position: relative; display: flex; align-items: center;";

        const previewImg = document.createElement("img");
        previewImg.src = e.target.result;
        previewImg.style.cssText = "width: 100px; border: 3px solid red; cursor: pointer;";

        // 📌 "업로드 예정" 배지 추가
        const uploadBadge = document.createElement("span");
        uploadBadge.textContent = "업로드 예정";
        uploadBadge.style.cssText = "position: absolute; top: 5px; left: 5px; background: red; color: white; padding: 2px 5px; font-size: 12px; border-radius: 3px;";

        previewWrapper.appendChild(previewImg);
        previewWrapper.appendChild(uploadBadge);
        uploadImageContainer.appendChild(previewWrapper);
      };
      reader.readAsDataURL(file);
    }
  });

  // 이미지를 모달에 표시하는 함수
  function displayImage(src, isNew = false, filename = null, comment = "") {
    //이미지와 관련 요소들을 감싸는 div 생성
    const imgWrapper = document.createElement("div");
    imgWrapper.style.cssText = "display:flex;align-items:center;margin-top:5px;"

    // 📌 이미지 요소 생성
    const img = document.createElement("img");
    img.src = src;
    img.style.width = "100px";
    img.style.cursor = "pointer";
    imgWrapper.appendChild(img);

    // 📌 이미지 클릭 시 전체 화면 확대 기능 추가
    img.addEventListener("click", function () {
      const fullScreenModal = document.createElement("div");
      fullScreenModal.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0, 0, 0, 0.8);display:flex;align-items:center;justify-content:center;z-index:2000;flex-direction:column;";

      const fullScreenImg = document.createElement("img");
      fullScreenImg.src = src;
      fullScreenImg.style.cssText = "max-width:90vw;max-height:80vh;border-radius:10px;";

      // 📌 코멘트 표시 박스
      const commentBox = document.createElement("div");
      commentBox.textContent = comment || "내용 없음"; // 코멘트가 없을 경우 기본값
      commentBox.style.cssText = "margin-top: 15px; padding: 10px 15px; background: rgba(0, 0, 0, 0.7); color: white; font-size: 16px; border-radius: 5px; max-width: 80vw; text-align: center;";

      fullScreenModal.appendChild(fullScreenImg);
      fullScreenModal.appendChild(commentBox);
      document.body.appendChild(fullScreenModal);

      // 📌전체 화면 모달 클릭 시 닫기
      fullScreenModal.addEventListener("click", function () {
        document.body.removeChild(fullScreenModal);
      });
    });

    // 📌 코멘트 표시 요소 생성
    const commentText = document.createElement("div");
    commentText.textContent = comment || "내용 없음"; // 코멘트가 없을 경우 기본값
    commentText.style.cssText = "flex-grow: 1; margin-left: 10px; font-size: 15px; color: #555; font-weight: bold;";
    imgWrapper.appendChild(commentText);

    // 📌 수정 버튼 생성
    const modifyButton = document.createElement("button");
    modifyButton.textContent = "수정";
    modifyButton.style.cssText = "margin-left:10px;padding:5px 10px;background:grey;color:white;border:none;cursor:pointer;";

    // ✏️ 수정 버튼 클릭 시 텍스트 입력창으로 변경
    modifyButton.addEventListener("click", function () {
      const newInput = document.createElement("input");//새 입력창 생성.
      newInput.type = "text"; //입력 타입을 텍스트로 설정
      newInput.value = commentText.textContent; //기존 코멘트를 입력창의 기본값으로 설정.
      newInput.style.marginLeft = "10px";
      newInput.style.width = "310px"; //입력창 크기 설정

      // 엔터 키 입력 시 수정 내용 저장
      newInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
          const newComment = newInput.value; //사용자가 Input에 입력한 새로운 코멘트 값.

          // 서버에 수정된 코멘트 저장 요청
          fetch(`/update_comment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filename, comment: newComment }),
          })
            .then((response) => response.json())//서버 응답을 JSON 형태로 변환.
            .then((data) => {
              if (data.success) { // 서버 응답이 성공(success)했을 때.
                commentText.textContent = newComment; // 기존 코멘트를 새로운 코멘트로 변경.
                imgWrapper.replaceChild(commentText, newInput); // 입력창을 다시 일반 텍스트로 변경.
                showCustomAlert("코멘트가 수정되었습니다!", "success");
              } else {
                showCustomAlert("수정 실패: " + data.error, "danger");
              }
            })
            .catch((error) => console.error("🔥 Error updating comment:", error));
        }
      });

      imgWrapper.replaceChild(newInput, commentText);
      newInput.focus(); // 자동 포커스, 수정 버튼을 누르면 바로 커서가 입력창 안에 위치.
    });

    // 📌 삭제 버튼 생성
    const deleteButton = document.createElement("button");  // 새 <button> 요소 생성.
    deleteButton.textContent = "삭제";
    deleteButton.style.cssText = "margin-left:10px;padding:5px 10px;background:#dc3545;color:white;border:none;cursor:pointer;";

    // 삭제 버튼 클릭 시 삭제 확인 모달 띄우기
    deleteButton.addEventListener("click", function () {
      showDeleteConfirmation(() => {
        //삭제할 이미지의 파일명을 URL에 안전하게 포함할 수 있도록 문자 인코딩 처리.
        //예를 들어 "사진 1.png" 같은 파일명이 있을 경우, 공백 등의 특수 문자가 포함되면 문제가 발생할 수 있으므로 "사진%201.png" 이런 식으로 변환함.
        fetch(`/deleteimg/${encodeURIComponent(filename)}`, { method: "DELETE" })
          .then((response) => response.json())//fetch()는 비동기 함수이므로 서버 응답을 기다려야 함, .json()을 사용하여 서버에서 받은 데이터를 JSON 형식으로 변환.
          .then((data) => {
            if (data.success) { // 서버에서 성공 응답을 보냈다면
              imageContainer.removeChild(imgWrapper); // 삭제 버튼을 누른 이미지의 div를 removeChild()를 사용해 제거
              showCustomAlert("사진이 삭제되었습니다!", "success");  // 사용자에게 삭제 성공 메시지를 띄움 (초록색 알림창).
            }
          });
      });
    });

    imgWrapper.appendChild(modifyButton); //수정 버튼을 이미지 컨테이너에 추가.
    imgWrapper.appendChild(deleteButton); //삭제 버튼을 이미지 컨테이너에 추가.
    imageContainer.appendChild(imgWrapper); //이미지 및 관련 요소를 화면에 표시.
    // 이미지와 버튼의 관계: imgWrapper가 이미지와 버튼을 감싸고 있어야 하므로 modifyButton과 deleteButton은 이미지 바로 뒤에 추가되어야 해.
    // 만약 imageContainer.appendChild(imgWrapper);가 먼저 실행되고 나서 버튼을 추가하면, 버튼들이 이미지 위로 겹쳐서 표시될 수 있고, 그 결과 UI가 깨질 수 있어.
  }

  // 📌 삭제 확인 모달 생성
  function showDeleteConfirmation(onConfirm) {
    // 📌 모달 배경 생성
    const modal = document.createElement("div");
    modal.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0, 0, 0, 0.6);display:flex;align-items:center;justify-content:center;z-index:3000;";

    // 📌 모달 내용 컨테이너
    const modalContent = document.createElement("div");
    modalContent.style.cssText = "background:white;padding:20px 30px;border-radius:8px;box-shadow:0px 5px 15px rgba(0,0,0,0.2);text-align:center;";

    // 📌 삭제 확인 메시지
    const message = document.createElement("p");
    message.textContent = "정말 삭제하시겠습니까?";
    message.style.cssText = "margin-bottom: 20px; font-size: 16px; font-weight: bold;";

    // 📌 버튼 컨테이너
    const btnContainer = document.createElement("div");
    btnContainer.style.cssText = "display:flex;gap:10px;justify-content:center;";

    // ✔️ '예' 버튼 (삭제 진행)
    const confirmBtn = document.createElement("button");
    confirmBtn.textContent = "예";
    confirmBtn.style.cssText = "padding:10px 20px;background:#dc3545;color:white;border:none;border-radius:5px;cursor:pointer;";
    confirmBtn.addEventListener("click", function () {
      document.body.removeChild(modal);
      onConfirm();
    });

    // ❌ '아니오' 버튼 (삭제 취소)
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "아니오";
    cancelBtn.style.cssText = "padding:10px 20px;background:#ccc;color:black;border:none;border-radius:5px;cursor:pointer;";
    cancelBtn.addEventListener("click", function () {
      document.body.removeChild(modal);
    });

    btnContainer.appendChild(confirmBtn); // "예" 버튼을 버튼 컨테이너에 추가.
    btnContainer.appendChild(cancelBtn); // "아니오" 버튼을 버튼 컨테이너에 추가.
    modalContent.appendChild(message); //삭제 확인 메시지를 모달 내용에 추가.
    modalContent.appendChild(btnContainer); // 버튼 컨테이너를 모달 내용에 추가.
    modal.appendChild(modalContent); // 모달 내용 컨테이너를 모달에 추가.
    document.body.appendChild(modal); // 최종적으로 모달을 화면에 추가.
  }

// 📌 커스텀 알림창
  function showCustomAlert(message, type = "info") {
    const alertBox = document.createElement("div"); // 알림 박스를 나타내는 div 요소를 생성.
    alertBox.textContent = message;
    alertBox.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 15px 20px;
        background: ${type === "success" ? "#28a745" : type === "error" ? "#dc3545" : "#007bff"};
        color: white;
        border-radius: 5px;
        font-size: 16px;
        box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 4000;
        opacity: 1;
        transition: opacity 0.5s ease-in-out;
    `; // opacity: 1: 처음에는 완전히 보이도록 설정. , transition: opacity 0.5s ease-in-out: 알림 박스가 사라질 때 서서히 사라지는 애니메이션을 설정.

    document.body.appendChild(alertBox); // 생성된 알림 박스를 페이지에 추가. 이제 화면에 알림 박스가 나타나게 됨.

    setTimeout(() => {
      alertBox.style.opacity = "0";
      setTimeout(() => document.body.removeChild(alertBox), 500);
    }, 2000);
  }

  // 저장 버튼 클릭 시 서버로 이미지 업로드
  saveButton.addEventListener("click", function () { // 사용자가 저장 버튼을 클릭하면 안쪽의 함수(콜백 함수)가 실행됨.
    if (uploadedFile) { //사용자가 파일을 선택했는지 확인하는 조건문. 즉, 파일을 선택하지 않고 버튼을 눌렀다면, 서버에 아무 요청도 보내지 않음.
      const formData = new FormData(); //FormData 객체는 파일 및 데이터를 서버로 보낼 때 사용하는 특수한 객체.키-값 쌍으로 데이터를 저장할 수 있으며,주로 multipart/form-data 형식으로 전송할 때 사용.
      formData.append("photo", uploadedFile);//선택한 이미지 파일 추가.
      formData.append("comment", commentInput.value);//사진에 대한 코멘트 추가.
      formData.append("fac_uid", fac_num);//시설물 관리번호 추가.
      formData.append("layer", fac_nam);//시설물 레이어 추가.
      console.log(formData, "face_check!!");

      fetch("img", {
        method: "POST",
        body: formData, // header를 따로 지정하지 않은 이유. -> FormData를 사용할 때는 브라우저가 자동으로 Content-Type: multipart/form-data를 설정하기 때문.
      })
        .then((response) => response.json())
        .then((data) => { // data 변수에는 서버에서 반환한 JSON 데이터가 저장됨.(data.url이 존재하면 성공한 것으로 판단.)
          if (data.url) { //서버에서 성공적으로 이미지를 저장했다면, 보통 저장된 이미지의 URL을 반환.
            showCustomAlert("사진이 저장되었습니다!", "success");
            loadImages(); // 업로드한 이미지 목록을 다시 불러옴. (새로운 이미지가 업로드되면 페이지를 새로고침하지 않고도 리스트가 갱신됨.)
          } else {
            showCustomAlert("사진 저장 실패!", "error");
          }
        })
        .catch((error) => alert("Error saving image!"));
    }
  });

  //서버에서 해당 시설물(fac_uid)에 저장된 이미지 목록을 불러오는 기능.
  function loadImages() {
    //fac_uid(시설물 ID)를 URL의 쿼리 파라미터로 전달하여 해당 시설물의 이미지만 가져옴.(ex: /images?fac_uid=12345)
    fetch(`/images?fac_uid=${fac_num}`)
      .then((response) => response.json())
      .then((data) => {
        imageContainer.innerHTML = ""; //새로운 이미지 목록을 표시하기 전에 기존 imageContainer 내용을 초기화(비움), 그렇지 않으면 새로운 이미지를 추가할 때마다 중복되어 표시될 수 있음.
        data.images.forEach(({ url, comment }) => {
          displayImage(url, false, url.split("/").pop(), comment); //url.split("/").pop() → 파일명만 추출!
        });
      })
      .catch((error) => console.error("Error loading images:", error));
  }

  modal.style.display = "block"; // 모달 화면 표시
  loadImages(); //모달이 열릴 때 loadImages();를 실행해서 해당 시설물의 이미지를 불러옴, 이렇게 하면 모달을 열 때마다 최신 이미지 목록이 표시됨.

  // 닫기 버튼 클릭 시 모달 닫기
  closeButton.addEventListener("click", function () {
    modal.style.display = "none"; //모달 창이 사라짐.
  });
}
