// 회원정보
function showMyPage(event) {
  event.preventDefault();
  if (!window.currentUser) return;

  var myPageModal = document.getElementById("myPageModal");
  document.getElementById(
    "myPageUsername"
  ).textContent = `${window.currentUser.username}님의 마이페이지`;
  document.getElementById("userId").textContent = window.currentUser.username;
  document.getElementById("userStudentId").textContent =
    window.currentUser.studentId;
  document.getElementById("userName").textContent = window.currentUser.name;
  document.getElementById("userPassword").textContent =
    window.currentUser.password;

  document.getElementById("editStudentId").value = window.currentUser.studentId;
  document.getElementById("editName").value = window.currentUser.name;
  document.getElementById("editPassword").value = window.currentUser.password;

  updateUserRecipes(window.currentUser.username);
  updateLikedRecipes(window.currentUser.username);
  updateUserComments(window.currentUser);

  // 로그아웃 버튼 이벤트 리스너 추가
  document.getElementById("logoutBtn").addEventListener("click", handleLogout);

  myPageModal.style.display = "block";
}

// 등록한 레시피 관련된 함수
// function updateUserRecipes(userId) {
//     fetch(`/user-recipes?userId=${userId}`)
//         .then(response => response.json())
//         .then(userRecipes => {
//             const userRecipeList = document.getElementById("userRecipeList");
//             userRecipeList.innerHTML = "";
//             userRecipes.forEach(recipe => {
//                 const li = document.createElement("li");
//                 li.textContent = recipe.name;
//                 li.classList.add("recipe-link");
//                 li.addEventListener("click", function () {
//                     showRecipeDetailsModal(recipe);
//                 });
//                 userRecipeList.appendChild(li);
//             });
//         })
//         .catch(error => console.error("Error fetching user recipes:", error));
// }

// Fetch and update user's recipes
function updateUserRecipes(userId) {
    fetch(`/user-recipes?userId=${userId}`)
      .then(response => response.json())
      .then(userRecipes => {
        const userRecipeTableBody = document.querySelector("#userRecipeTable tbody");
        userRecipeTableBody.innerHTML = "";
        userRecipes.forEach((recipe, index) => {
          const tr = document.createElement("tr");
  
          const checkboxTd = document.createElement("td");
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.classList.add("recipe-checkbox");
          checkbox.dataset.recipeName = recipe.name;
          checkboxTd.appendChild(checkbox);
  
          const indexTd = document.createElement("td");
          indexTd.textContent = index + 1;
  
          const nameTd = document.createElement("td");
          nameTd.textContent = recipe.name;
          nameTd.classList.add("recipe-link");
          nameTd.addEventListener("click", function () {
            showRecipeDetailsModal(recipe);
          });
  
          const dateTd = document.createElement("td");
          dateTd.textContent = recipe.updatedAt ? new Date(recipe.updatedAt).toLocaleDateString() : "날짜 없음";
  
          const deleteTd = document.createElement("td");
          const deleteBtn = document.createElement("button");
          deleteBtn.textContent = "삭제";
          deleteBtn.classList.add("delete-btn");
          deleteBtn.addEventListener("click", function () {
            handleDeleteRecipe(recipe.name, userId);
          });
  
          deleteTd.appendChild(deleteBtn);
          tr.appendChild(checkboxTd);
          tr.appendChild(indexTd);
          tr.appendChild(nameTd);
          tr.appendChild(dateTd);
          tr.appendChild(deleteTd);
  
          userRecipeTableBody.appendChild(tr);
        });
  
        // 전체 선택 체크박스 이벤트 리스너
        document.querySelector(".overall-checkbox").addEventListener("change", function (event) {
          const isChecked = event.target.checked;
          document.querySelectorAll(".recipe-checkbox").forEach(checkbox => {
            checkbox.checked = isChecked;
          });
        });
  
        // 일괄 삭제 버튼 이벤트 리스너
        document.getElementById("bulkDeleteBtn").addEventListener("click", function () {
          handleBulkDelete(userId);
        });
      })
      .catch(error => console.error("Error fetching user recipes:", error));
  }
  
  // Handle single recipe delete
  function handleDeleteRecipe(recipeName, userId) {
    if (confirm(`레시피 '${recipeName}'을(를) 삭제하시겠습니까?`)) {
      fetch(`/delete-recipe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ recipeName, userId })
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            alert("레시피가 성공적으로 삭제되었습니다.");
            updateUserRecipes(userId); // 삭제 후 목록 갱신
          } else {
            alert("레시피 삭제 중 오류가 발생했습니다: " + data.message);
          }
        })
        .catch(error => console.error("레시피 삭제 중 오류가 발생했습니다:", error));
    }
  }
  
  // Handle bulk delete
  function handleBulkDelete(userId) {
    const selectedRecipes = Array.from(document.querySelectorAll(".recipe-checkbox:checked")).map(checkbox => checkbox.dataset.recipeName);
  
    if (selectedRecipes.length === 0) {
      alert("삭제할 레시피를 선택해 주세요.");
      return;
    }
  
    if (confirm(`선택한 레시피를 삭제하시겠습니까?`)) {
      fetch(`/bulk-delete-recipes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ recipeNames: selectedRecipes, userId })
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            alert("선택한 레시피가 성공적으로 삭제되었습니다.");
            updateUserRecipes(userId); // 삭제 후 목록 갱신
          } else {
            alert("레시피 삭제 중 오류가 발생했습니다.");
          }
        })
        .catch(error => console.error("레시피 삭제 중 오류가 발생했습니다:", error));
    }
  }
  
// 전체 선택 체크박스 기능 추가
document
  .querySelector(".overall-checkbox")
  .addEventListener("change", function (event) {
    const isChecked = event.target.checked;
    const checkboxes = document.querySelectorAll(".recipe-checkbox");
    checkboxes.forEach((checkbox) => {
      checkbox.checked = isChecked;
    });
  });

// 좋아요한 레시피 관련
function updateLikedRecipes(userId) {
  fetch(`/liked-recipes?userId=${userId}`)
    .then((response) => response.json())
    .then((likedRecipes) => {
      const likedRecipeList = document.getElementById("likedRecipeList");
      likedRecipeList.innerHTML = "";
      likedRecipes.forEach((recipe) => {
        const li = document.createElement("li");
        li.textContent = recipe.name;
        li.classList.add("recipe-link");
        li.addEventListener("click", function () {
          fetchRecipeDetails(recipe.name);
        });
        likedRecipeList.appendChild(li);
      });
    })
    .catch((error) => console.error("Error fetching liked recipes:", error));
}

function updateUserComments(user) {
  var userCommentList = document.getElementById("userCommentList");
  userCommentList.innerHTML = "";
  if (user.comments) {
    user.comments.forEach((comment) => {
      var li = document.createElement("li");
      li.textContent = comment;
      userCommentList.appendChild(li);
    });
  }
}

function showRecipeDetailsModal(recipe) {
  var modal = document.querySelector(".recipe-details-modal");
  document.querySelector(".recipe-name").textContent = recipe.name;
  document.querySelector(
    ".recipe-details-filters .filter:nth-child(1)"
  ).textContent = recipe.time;
  document.querySelector(
    ".recipe-details-filters .filter:nth-child(2)"
  ).textContent = recipe.category;
  document.querySelector(".recipe-details-image").src = "image/" + recipe.image;
  document.querySelector(".recipe-ingredients p").textContent = recipe.material;
  document.querySelector(".recipe-instructions p").textContent = recipe.recipe;

  var likeBtn = document.querySelector(".recipe-details-modal .like-btn");
  var likeCount = document.querySelector(".recipe-details-modal .like-count");
  likeCount.textContent = recipe.likes || 0;

  likeBtn.onclick = function () {
    recipe.likes = (recipe.likes || 0) + 1;
    likeCount.textContent = recipe.likes;
    updateLikeCountInList(recipe);
    addRecipeToLikedRecipes(recipe);
  };

  modal.style.display = "block";
}

function updateLikeCountInList(recipe) {
  const recipeItems = document.querySelectorAll(".tm-list-item");
  recipeItems.forEach((item) => {
    const itemName = item.querySelector(".tm-list-item-name").textContent;
    if (itemName === recipe.name) {
      const likeCount = item.querySelector(".like-count");
      likeCount.textContent = recipe.likes;
    }
  });
}

function addRecipeToLikedRecipes(recipe) {
  fetch("/like-recipe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: window.currentUser.username,
      recipeName: recipe.name,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        updateLikedRecipes(window.currentUser.username);
      }
    })
    .catch((error) => console.error("Error liking recipe:", error));
}

function fetchRecipeDetails(recipeName) {
  return fetch("/menu-items")
    .then((response) => response.json())
    .then((menuItems) => {
      return menuItems.find((item) => item.name === recipeName);
    })
    .catch((error) => console.error("Error fetching recipe details:", error));
}

// 로그아웃버튼
function handleLogout() {
  window.currentUser = null;
  localStorage.removeItem("currentUser"); // localStorage에서 사용자 정보 제거
  alert("로그아웃 되었습니다.");

  var navbarNav = document.querySelector(".navbar-nav");
  var myPageBtn = document.getElementById("myPageBtn").closest("li");
  if (myPageBtn) {
    var loginBtn = document.createElement("li");
    loginBtn.className = "nav-item";
    loginBtn.innerHTML = `<button class="btn nav-link login-button" type="button" id="loginBtn">
                                <i class="fa fa-user" aria-hidden="true"></i> Login
                            </button>`;
    navbarNav.replaceChild(loginBtn, myPageBtn);

    loginBtn.querySelector("#loginBtn").addEventListener("click", function () {
      var loginModal = document.getElementById("loginModal");
      loginModal.style.display = "block";
    });
  }

  history.pushState(null, "", "/");
  location.reload();
}

// 닫기 버튼
var closeMyPageBtn = document.querySelector(".close-mypage");
closeMyPageBtn.onclick = function () {
  var myPageModal = document.getElementById("myPageModal");
  myPageModal.style.display = "none";
};

var closeRecipeDetailsBtn = document.querySelector(".recipe-details-close");
closeRecipeDetailsBtn.onclick = function () {
  var recipeDetailsModal = document.querySelector(".recipe-details-modal");
  recipeDetailsModal.style.display = "none";
};

window.onclick = function (event) {
  var myPageModal = document.getElementById("myPageModal");
  var recipeDetailsModal = document.querySelector(".recipe-details-modal");
  if (event.target == myPageModal) {
    myPageModal.style.display = "none";
  }
  if (event.target == recipeDetailsModal) {
    recipeDetailsModal.style.display = "none";
  }
};

function fetchRecipeDetails(recipeName) {
  fetch("/menu-items")
    .then((response) => response.json())
    .then((menuItems) => {
      const recipe = menuItems.find((item) => item.name === recipeName);
      if (recipe) {
        showRecipeDetailsModal(recipe);
      }
    })
    .catch((error) => console.error("Error fetching recipe details:", error));
}

document.addEventListener("DOMContentLoaded", function () {
  // 회원 정보 수정 폼 제출 처리
  const editUserForm = document.getElementById("editUserForm");
  editUserForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const updatedUser = {
      studentId: document.getElementById("editStudentId").value,
      name: document.getElementById("editName").value,
      password: document.getElementById("editPassword").value,
    };

    fetch("/update-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        studentId: window.currentUser.studentId,
        updatedUser,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          alert(data.message);
          if (data.success) {
            window.currentUser = { ...window.currentUser, ...updatedUser }; // 업데이트된 정보로 현재 사용자 정보 갱신
            localStorage.setItem(
              "currentUser",
              JSON.stringify(window.currentUser)
            ); // 로컬 저장소 갱신
            updateUIForLoggedInUser(window.currentUser.username); // UI 업데이트
            document.getElementById("myPageModal").style.display = "none"; // 모달 닫기
          }
        }
      })
      .catch((error) => console.error("Error updating user:", error));
  });
});
