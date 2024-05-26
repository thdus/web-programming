document.addEventListener("DOMContentLoaded", function () {
    window.currentUser = null;
  
    // 로그인 상태 복원
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      window.currentUser = JSON.parse(savedUser);
      updateUIForLoggedInUser(window.currentUser.username);
    }
  
    var loginForm = document.getElementById("loginForm");
  
    // 로그인 폼 제출 처리
    loginForm.onsubmit = function (event) {
      event.preventDefault(); // 기본 폼 제출 방지
      var username = document.getElementById("username").value;
      var password = document.getElementById("password").value;
  
      fetch("data/users.json")
        .then((response) => response.json())
        .then((users) => {
          var user = users.find(
            (user) => user.username === username && user.password === password
          );
          if (user) {
            window.currentUser = user; // 로그인된 사용자 정보 저장
            localStorage.setItem("currentUser", JSON.stringify(user)); // localStorage에 저장
            alert("로그인 성공!");
            loginForm.reset(); // 로그인 성공 시 폼 리셋
            document.getElementById("loginModal").style.display = "none"; // 로그인 모달 닫기
  
            // 로그인 후 UI 업데이트
            updateUIForLoggedInUser(user.username);
  
            // 로그인 후 메인 페이지로 이동
            window.location.href = "/index.html";
          } else {
            alert("아이디 또는 비밀번호가 잘못되었습니다.");
          }
        })
        .catch((error) => console.error("Error:", error));
    };
  
    function updateUIForLoggedInUser(username) {
      var navbarNav = document.querySelector(".navbar-nav");
      var loginBtn = document.getElementById("loginBtn");
      if (loginBtn) {
        var welcomeMessage = document.createElement("li");
        welcomeMessage.className = "nav-item";
        welcomeMessage.innerHTML = `<a class="nav-link"> ${username}님, 환영합니다 </a>`;
  
        var myPageButton = document.createElement("li");
        myPageButton.className = "nav-item";
        myPageButton.innerHTML = `<a class="nav-link" href="#" id="myPageBtn">마이페이지</a>`;
  
        loginBtn.parentNode.replaceChild(welcomeMessage, loginBtn);
        navbarNav.appendChild(myPageButton);
  
        myPageButton.addEventListener("click", showMyPage);
      }
  
      setButtonEventListeners();
    }
  
    // 로그인 모달 제어
    var loginBtn = document.getElementById("loginBtn");
    var loginModal = document.getElementById("loginModal");
    var closeBtn = document.querySelector(".close");
  
    // 로그인 모달 표시
    loginBtn.onclick = function () {
      loginModal.style.display = "block";
    };
  
    // 로그인 모달 닫기
    closeBtn.onclick = function () {
      loginModal.style.display = "none";
    };
  
    // 모달 외부 클릭 시 로그인 모달 닫기
    window.onclick = function (event) {
      if (event.target == loginModal) {
        loginModal.style.display = "none";
      }
      if (event.target == loginWarningModal) {
        loginWarningModal.style.display = "none";
      }
    };
  
    // 특정 버튼들에 클릭 이벤트 리스너 추가
    function addLoginCheck(buttonSelector) {
      document.querySelectorAll(buttonSelector).forEach(function (button) {
        if (!button.classList.contains("login-button") && !button.classList.contains("login-submit-btn") && !button.classList.contains("register-submit-btn")) {
          button.addEventListener("click", function (event) {
            if (!window.currentUser) {
              event.preventDefault();
              document.getElementById("loginWarningModal").style.display = "block";
            }
          });
        }
      });
    }
  
    // 로그인 체크가 필요한 버튼들에 대해서만 리스너 추가
    addLoginCheck("button"); // 모든 버튼 선택, login-button, login-submit-btn 및 register-submit-btn 제외
  
    // 로그인 필요 모달 제어
    var loginWarningModal = document.getElementById("loginWarningModal");
    var loginWarningClose = document.querySelector(".login-warning-close");
  
    // 로그인 필요 모달 닫기
    loginWarningClose.onclick = function () {
      loginWarningModal.style.display = "none";
    };
  
    // 모달 외부 클릭 시 로그인 필요 모달 닫기
    window.onclick = function (event) {
      if (event.target == loginWarningModal) {
        loginWarningModal.style.display = "none";
      }
    };
  
    // 로그인 체크가 필요한 동적으로 추가된 버튼들에 대해서도 리스너 추가
    function attachEventListeners() {
      addLoginCheck(".details-btn");
      addLoginCheck(".like-btn");
      addLoginCheck(".comment-btn");
      addLoginCheck(".share-btn");
      addLoginCheck(".comment-submit-btn");
    }
  
    // 페이지가 로드될 때 기존 버튼들에 대해서 로그인 체크 추가
    attachEventListeners();
  
    // 메뉴 아이템을 로드한 후에도 동적으로 추가된 버튼들에 대해 로그인 체크 추가
    window.attachEventListeners = attachEventListeners;
  });
  