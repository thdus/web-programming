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

document.addEventListener("DOMContentLoaded", function () {
  var loginBtn = document.getElementById("loginBtn");
  var loginModal = document.getElementById("loginModal");
  var closeBtn = document.querySelector(".close");

  var registerLink = document.getElementById("registerLink");
  var registerModal = document.getElementById("registerModal");
  var closeRegisterBtn = document.querySelector(".close-register");

  // 로그인 모달 표시
  loginBtn.onclick = function () {
    loginModal.style.display = "block";
  };

  // 로그인 모달 닫기
  closeBtn.onclick = function () {
    loginModal.style.display = "none";
  };

  // 회원가입 모달 표시
  registerLink.onclick = function (event) {
    event.preventDefault();
    loginModal.style.display = "none";
    registerModal.style.display = "block";
  };

  // 회원가입 모달 닫기
  closeRegisterBtn.onclick = function () {
    registerModal.style.display = "none";
  };

  // 모달 외부 클릭 시 모달 닫기
  window.onclick = function (event) {
    if (event.target == loginModal) {
      loginModal.style.display = "none";
    }
    if (event.target == registerModal) {
      registerModal.style.display = "none";
    }
  };

  // 회원가입 폼 제출 시 ID 중복 확인 및 폼 제출
  var registerForm = document.getElementById("registerForm");
  registerForm.onsubmit = function (event) {
    event.preventDefault();
    var newUsername = document.getElementById("new-username").value;
    var errorMessage = document.getElementById("error-message");

    console.log("Checking username:", newUsername);

    fetch('/check-username?username=' + newUsername)
      .then(response => response.json())
      .then(data => {
        if (data.exists) {
          errorMessage.textContent = "이미 존재하는 ID입니다.";
        } else {
          // 사용자 이름이 사용 가능하면 폼 데이터를 수동으로 전송
          errorMessage.textContent = "";
          console.log("Username is available, submitting form");

          var formData = new FormData(registerForm);
          fetch('/register', {
            method: 'POST',
            body: formData
          })
          .then(response => response.json())
          .then(result => {
            if (result.message) {
              errorMessage.textContent = result.message;
            }
          })
          .catch(error => {
            console.error('Error:', error);
            errorMessage.textContent = '회원가입 중 오류가 발생했습니다.';
          });
        }
      })
      .catch(error => console.error('Error:', error));
  };
});

