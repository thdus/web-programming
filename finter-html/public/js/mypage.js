// 회원정보
function showMyPage(event) {
    event.preventDefault();
    if (!window.currentUser) return;

    var myPageModal = document.getElementById("myPageModal");
    document.getElementById("myPageUsername").textContent = `${window.currentUser.username}님의 마이페이지`;
    document.getElementById("userStudentId").textContent = window.currentUser.studentId;
    document.getElementById("userName").textContent = window.currentUser.name;
    document.getElementById("userId").textContent = window.currentUser.username;
    document.getElementById("userPassword").textContent = window.currentUser.password;

    updateUserRecipes(window.currentUser.username);
    updateLikedRecipes(window.currentUser.username);
    updateUserComments(window.currentUser);

    // 로그아웃 버튼 이벤트 리스너 추가
    document.getElementById("logoutBtn").addEventListener("click", handleLogout);

    myPageModal.style.display = "block";
}

// 등록한 레시피 관련된 함수
function updateUserRecipes(userId) {
    fetch(`/user-recipes?userId=${userId}`)
        .then(response => response.json())
        .then(userRecipes => {
            const userRecipeList = document.getElementById("userRecipeList");
            userRecipeList.innerHTML = "";
            userRecipes.forEach(recipe => {
                const li = document.createElement("li");
                li.textContent = recipe.name;
                li.classList.add("recipe-link");
                li.addEventListener("click", function () {
                    showRecipeDetailsModal(recipe);
                });
                userRecipeList.appendChild(li);
            });
        })
        .catch(error => console.error("Error fetching user recipes:", error));
}

// 좋아요한 레시피 관련
function updateLikedRecipes(userId) {
    fetch(`/liked-recipes?userId=${userId}`)
        .then(response => response.json())
        .then(likedRecipes => {
            const likedRecipeList = document.getElementById("likedRecipeList");
            likedRecipeList.innerHTML = "";
            likedRecipes.forEach(recipeName => {
                const li = document.createElement("li");
                li.textContent = recipeName;
                li.classList.add("recipe-link");
                li.addEventListener("click", function () {
                    fetchRecipeDetails(recipeName);
                });
                likedRecipeList.appendChild(li);
            });
        })
        .catch(error => console.error("Error fetching liked recipes:", error));
}

function updateUserComments(user) {
    var userCommentList = document.getElementById("userCommentList");
    userCommentList.innerHTML = "";
    if (user.comments) {
        user.comments.forEach(comment => {
            var li = document.createElement("li");
            li.textContent = comment;
            userCommentList.appendChild(li);
        });
    }
}

function showRecipeDetailsModal(recipe) {
    var modal = document.querySelector(".recipe-details-modal");
    document.querySelector(".recipe-name").textContent = recipe.name;
    document.querySelector(".recipe-details-filters .filter:nth-child(1)").textContent = recipe.time;
    document.querySelector(".recipe-details-filters .filter:nth-child(2)").textContent = recipe.category;
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
    recipeItems.forEach(item => {
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
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            userId: window.currentUser.username,
            recipeName: recipe.name
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            updateLikedRecipes(window.currentUser.username);
        }
    })
    .catch(error => console.error("Error liking recipe:", error));
}

function fetchRecipeDetails(recipeName) {
    return fetch("/menu-items")
        .then(response => response.json())
        .then(menuItems => {
            return menuItems.find(item => item.name === recipeName);
        })
        .catch(error => console.error("Error fetching recipe details:", error));
}


// 로그아웃버튼
function handleLogout() {
    window.currentUser = null;
    localStorage.removeItem("currentUser"); // localStorage에서 사용자 정보 제거
    alert('로그아웃 되었습니다.');

    var navbarNav = document.querySelector(".navbar-nav");
    var myPageBtn = document.getElementById("myPageBtn").closest('li');
    if (myPageBtn) {
        var loginBtn = document.createElement("li");
        loginBtn.className = "nav-item";
        loginBtn.innerHTML = `<button class="btn nav-link login-button" type="button" id="loginBtn">
                                <i class="fa fa-user" aria-hidden="true"></i> Login
                            </button>`;
        navbarNav.replaceChild(loginBtn, myPageBtn);

        loginBtn.querySelector('#loginBtn').addEventListener("click", function () {
            var loginModal = document.getElementById("loginModal");
            loginModal.style.display = "block";
        });
    }

    history.pushState(null, '', '/');
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
        .then(response => response.json())
        .then(menuItems => {
            const recipe = menuItems.find(item => item.name === recipeName);
            if (recipe) {
                showRecipeDetailsModal(recipe);
            }
        })
        .catch(error => console.error("Error fetching recipe details:", error));
}

document.addEventListener("DOMContentLoaded", function () {
    

    // 회원 정보 수정 폼 제출 처리
    const editUserForm = document.getElementById("editUserForm");
    editUserForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const updatedUser = {
            studentId: document.getElementById("editStudentId").value,
            name: document.getElementById("editName").value,
            username: document.getElementById("editUsername").value,
            password: document.getElementById("editPassword").value
        };

        fetch("/update-user", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ oldUsername: window.currentUser.username, updatedUser })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert(data.message);
                if (data.success) {
                    window.currentUser = updatedUser; // 업데이트된 정보로 현재 사용자 정보 갱신
                    localStorage.setItem("currentUser", JSON.stringify(updatedUser)); // 로컬 저장소 갱신
                    updateUIForLoggedInUser(updatedUser.username); // UI 업데이트
                    document.getElementById("myPageModal").style.display = "none"; // 모달 닫기
                }
            }
        })
        .catch(error => console.error("Error updating user:", error));
    });

 
});
