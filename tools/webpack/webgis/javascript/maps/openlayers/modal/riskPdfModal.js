import { selectInteraction } from "../map";

let modalContainer = null; // Declare a variable to store the modal container

// Open modal function
function openModal() {
  modalContainer.style.display = 'flex';
}

// Close modal function
function closeModal(event) {
  if (event.target === modalContainer) {
    modalContainer.style.display = 'none';
    modalContainer.removeEventListener('click', closeModal);
    // Reattach the event listener for future clicks
    modalContainer.addEventListener('click', closeModal);
  } else if (event.target.id === 'closeModal') {
    modalContainer.style.display = 'none';
    modalContainer.removeEventListener('click', closeModal);
    // Reattach the event listener for future clicks
    modalContainer.addEventListener('click', closeModal);
  }
}

function onClickRiskOverlay(event) {
  // Check if a modal is already open, and if so, close it
  if (modalContainer) {
    closeModal({ target: modalContainer });
  }

  const newFeature = selectInteraction.getFeatures().getArray().map(f => {
    const number = f.get('관리번호');
    const pdfname = `${number}.pdf`;
    return pdfname
  });

  // Create a modal container
  modalContainer = document.createElement('div');
  modalContainer.className = 'modal-container';

  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  modalContent.innerHTML = `<div class="navbar-nav">
        <div class="nav-item text-nowrap" id="pdfmodal">
          <a href="pdfjs-4.0.189-dist/web/viewer.html?file=risk/${newFeature}">크게보기</a>
          <br>
          <iframe src="pdfjs-4.0.189-dist/web/viewer.html?file=risk/${newFeature}" style="width:100%; height:500px; border:1px solid black;"></iframe>
        </div>
      </div>
      <button id="closeModal">닫기</button>`;

  // Append modal content to modal container
  modalContainer.appendChild(modalContent);

  // Append modal container to the body
  document.body.appendChild(modalContainer);

  // Style the modal container and content
  modalContainer.style.display = 'none';
  modalContainer.style.position = 'absolute';
  modalContainer.style.top = '0';
  modalContainer.style.bottom = '0';
  modalContainer.style.left = '0';
  modalContainer.style.right = '50px';
  modalContainer.style.marginRight = '500px';
  modalContainer.style.marginLeft = '500px';
  modalContainer.style.marginBottom = '500px';
  modalContainer.style.width = 'auto';
  modalContainer.style.height = '100%';
  modalContainer.style.justifyContent = 'center';
  modalContainer.style.alignItems = 'center';
  modalContainer.style.zIndex = '10';

  modalContent.style.backgroundColor = '#fff';
  modalContent.style.padding = '10px';
  modalContent.style.borderRadius = '8px';
  modalContent.style.textAlign = 'center';
  modalContent.style.zIndex = '10';
  modalContent.style.bottom = '50pxpx';

  // Attach open and close modal functions to elements
  document.getElementById('pdfmodal2').addEventListener('click', openModal);
  modalContainer.addEventListener('click', closeModal);
  document.getElementById('closeModal').addEventListener('click', closeModal);
}

export { onClickRiskOverlay };
