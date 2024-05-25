document.addEventListener("DOMContentLoaded", function () {
  var registerLink = document.getElementById("registerLink");
  var registerModal = document.getElementById("registerModal");
  var closeRegisterBtn = document.querySelector(".close-register");

  // 회원가입 모달 표시
  registerLink.onclick = function (event) {
    event.preventDefault();
    var loginModal = document.getElementById("loginModal");
    loginModal.style.display = "none";
    registerModal.style.display = "block";
  };

  // 회원가입 모달 닫기
  closeRegisterBtn.onclick = function () {
    registerModal.style.display = "none";
  };

  // 모달 외부 클릭 시 회원가입 모달 닫기
  window.onclick = function (event) {
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
            } else {
              alert("회원가입이 완료되었습니다.");
              registerModal.style.display = "none"; // 회원가입 성공 시 모달 닫기
              registerForm.reset(); // 회원가입 폼 리셋
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
