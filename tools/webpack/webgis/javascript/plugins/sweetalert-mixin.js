/* eslint-disable no-undef */
const defaultOptions = {
  showCancelButton: true,
  cancelButtonText: '아니오',
  customClass: {
    confirmButton: 'btn btn-success font-weight-bolder',
    cancelButton: 'btn btn-danger font-weight-bolder',
  },
  padding: '0',
  width: '25rem',
  allowOutsideClick: false,
};

export default {
  confirmServiceStatusDone: Swal.mixin({
    ...defaultOptions,
    icon: 'success',
    title: '선택한 민원(들)을 처리완료합니까?',
    text: '처리완료한 민원은 수정할 수 없습니다',
    confirmButtonText: '예, 완료합니다',
  }),

  confirmServiceDelete: Swal.mixin({
    ...defaultOptions,
    icon: 'error',
    title: '선택한 민원(들)을 삭제합니까?',
    text: '삭제한 민원은 조회할 수 없습니다',
    confirmButtonText: '예, 삭제합니다',
  }),
};
