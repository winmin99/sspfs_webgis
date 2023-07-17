## Database Table Names

### 경주 (WFIS47130A)

* `wtt_st_image`: 정보보기 → 사진보기 에 연결된 사진 (ex. 가압장, 제수변 사진 등).
    * 감압변, 배기변 등의 기타 변류시설도 모두 'SA200(제수변)' 으로 분류되어 사진이 등록되니 주의한다.

* `viw_web_wutl_ht_img`: 정보보기 → 보수내역 기능에 연결된 뷰 테이블. `wtt_wutl_ht`, `swt_subimge_et` 를 포함한다.
* `wtt_wutl_ht`: 정보보기 → 보수내역 에서 각각의 유지보수 이력 항목.
* `swt_subimge_et`: 정보보기 → 보수내역 에서 각각의 유지보수 이력 항목에 연결된 사진 테이블.


* `wtt_wutl_ht`: 별도로 추가된 "보수공사" 레이어
* `wtt_subimge_et_re`: 별도로 추가된 "보수공사" 레이어의 정보보기 → 사진보기에 연결된 사진 테이블.

### 영주 (WFIS47210A)

* `wtt_st_image`: 정보보기 → 사진보기 에 연결된 사진 (ex. 가압장, 제수변 사진 등).
    * 감압변, 배기변 등의 기타 변류시설도 모두 'SA200(제수변)' 으로 분류되어 사진이 등록되니 주의한다.

* `viw_web_wutl_ht_img`: 정보보기 → 보수내역 기능에 연결된 뷰 테이블. `swt_sutl_ht`, `swt_subimge_et_st` 를 포함한다.
* `swt_sutl_ht`: 정보보기 → 보수내역 에서 각각의 유지보수 이력 항목.
* `swt_subimge_et_st`: 정보보기 → 보수내역 에서 각각의 유지보수 이력 항목에 연결된 사진 테이블.


* `wtt_wutl_ht`: 별도로 추가된 "보수공사" 레이어.
* `swt_subimge_et`: 별도로 추가된 "보수공사" 레이어의 정보보기 → 사진보기에 연결된 사진 테이블.


|                     | 경주 WFIS47130A     | 영주 WFIS47210A     |
|---------------------|---------------------|---------------------|
| 정보보기 → 사진보기 | wtt_st_image        | wtt_st_image        |
| 정보보기 → 보수내역 | viw_web_wutl_ht_img | viw_web_wutl_ht_img |
| 보수내역 이력       | **wtt_wutl_ht**         | **swt_sutl_ht**         |
| 보수내역 사진       | **swt_subimge_et**      | **swt_subimge_et_st**   |
| 보수공사            | wtt_wutl_ht         | wtt_wutl_ht         |
| 보수공사 사진       | **wtt_subimge_et_re**   | **swt_subimge_et**      |
