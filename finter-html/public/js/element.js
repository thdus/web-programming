// 음식 이름 : foodNameInput
// 조리 시간 : select : cookingTimeoption | 5~30분, 1시간 이상
// 음식 종류 : select : foodCategory | 한식,중식,일식,양식, 기타
// 재료 : material
// 레시피 : recipe
// 음식사진 : uploadPhoto

// DOM이 로드된 후에 실행
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form"); // 폼 선택자

  form.addEventListener("submit", function (event) {
    // 폼 제출 이벤트 리스너
    const formData = new FormData(form); // 폼 데이터 객체 생성

    fetch("/upload-data", {
      method: "POST", // POST 요청
      body: formData, // 요청 본문
    })
      .then((response) => response.json()) // 응답을 JSON으로 파싱
      .then((data) => {
        fetchMenuItems(); // 메뉴 아이템을 새로고침
      })
      .catch((error) => {
        // 에러 처리
        console.error("Error:", error);
        alert("An error occurred while uploading data");
      });

      
  });

  function fetchMenuItems() {
    // 메뉴 아이템을 불러오는 함수
    fetch("/menu-items")
      .then((response) => response.text()) // 응답을 텍스트로 파싱
      .then((html) => {
        document.querySelector(".tm-list").innerHTML = html; // 화면에 새로운 메뉴 아이템 표시
      })
      .catch((error) => {
        // 에러 처리
        console.error("Error loading menu items:", error);
      });
  }
});


