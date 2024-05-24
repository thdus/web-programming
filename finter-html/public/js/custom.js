document.addEventListener("DOMContentLoaded", function () {
  
  //여기서 받아오는듯
    var loginForm = document.getElementById("loginForm");
  document
    .querySelector('form[action="/upload-data"]')
    .addEventListener("submit", function (event) {
      if (!window.currentUser) {
        event.preventDefault();
        alert("로그인이 필요합니다.");
        return;
      }
      var userIdInput = document.createElement("input");
      userIdInput.type = "hidden";
      userIdInput.name = "userId";
      userIdInput.value = window.currentUser.username;
      this.appendChild(userIdInput);
    });
  loginForm.onsubmit = function (event) {
    event.preventDefault(); // 기본 폼 제출 방지
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    fetch("users.json")
      .then((response) => response.json())
      .then((users) => {
        var user = users.find(
          (user) => user.username === username && user.password === password
        );
        if (user) {
          alert("로그인 성공!");
        } else {
          alert("아이디 또는 비밀번호가 잘못되었습니다.");
        }
      })
      .catch((error) => console.error("Error:", error));
  };
});
