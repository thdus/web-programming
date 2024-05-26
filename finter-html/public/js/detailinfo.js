function showRecipeDetailsModal(recipe) {
    const modal = document.querySelector(".recipe-details-modal");
    document.querySelector(".recipe-name").textContent = recipe.name;
    document.querySelector(".recipe-details-filters .filter:nth-child(1)").textContent = recipe.time;
    document.querySelector(".recipe-details-filters .filter:nth-child(2)").textContent = recipe.category;
    document.querySelector(".recipe-details-image").src = `image/${recipe.image}`;
    document.querySelector(".recipe-ingredients p").textContent = recipe.material;
    document.querySelector(".recipe-instructions p").textContent = recipe.recipe;

    const likeBtn = modal.querySelector(".like-btn");
    const likeCount = modal.querySelector(".like-count");
    likeCount.textContent = recipe.likes || 0;

    likeBtn.onclick = function () {
        if (!window.currentUser) {
            showLoginWarningModal();
            return;
        }
        recipe.likes = (recipe.likes || 0) + 1;
        likeCount.textContent = recipe.likes;
        updateLikeCountInList(recipe);
        addRecipeToLikedRecipes(recipe);
    };

    modal.style.display = "block";
}

function setButtonEventListeners() {
    // 좋아요 버튼 클릭 이벤트 설정
    document.querySelectorAll(".like-btn").forEach(button => {
        button.addEventListener("click", function(event) {
            if (!window.currentUser) {
                showLoginWarningModal();
                return;
            }
            event.stopPropagation();
            const listItem = button.closest(".tm-list-item");
            const itemData = JSON.parse(listItem.getAttribute("data-item"));

            // 좋아요 수 업데이트
            itemData.likes = (itemData.likes || 0) + 1;
            listItem.querySelector(".like-count").textContent = itemData.likes;

            // 서버에 좋아요 수 업데이트
            fetch("/like-recipe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: window.currentUser.username,
                    recipeName: itemData.name
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    updateLikedRecipes(window.currentUser.username);
                    // 상세 정보 모달의 좋아요 수 업데이트
                    updateLikeCountInDetailsModal(itemData.name, itemData.likes);
                }
            })
            .catch(error => console.error("Error liking recipe:", error));
        });
    });

    // 댓글 버튼 클릭 이벤트 설정
    document.querySelectorAll(".comment-btn").forEach(button => {
        button.addEventListener("click", function(event) {
            if (!window.currentUser) {
                showLoginWarningModal();
                return;
            }
            event.stopPropagation();
            const listItem = button.closest(".tm-list-item");
            const detailsModal = document.querySelector(".recipe-details-modal");
            const commentsSection = detailsModal.querySelector(".comment-list");

            const commentListModal = document.createElement("div");
            commentListModal.classList.add("comment-list-modal");
            commentListModal.innerHTML = `
                <div class="comment-list-content">
                    <span class="comment-list-close">&times;</span>
                    ${commentsSection.innerHTML}
                </div>
            `;
            document.body.appendChild(commentListModal);
            commentListModal.style.display = "block";

            const closeBtn = commentListModal.querySelector(".comment-list-close");
            closeBtn.addEventListener("click", function () {
                commentListModal.style.display = "none";
                document.body.removeChild(commentListModal);
            });

            window.addEventListener("click", function (event) {
                if (event.target === commentListModal) {
                    commentListModal.style.display = "none";
                    document.body.removeChild(commentListModal);
                }
            });
        });
    });

    // 공유 버튼 클릭 이벤트 설정
    document.querySelectorAll(".share-btn").forEach(button => {
        button.addEventListener("click", function(event) {
            if (!window.currentUser) {
                showLoginWarningModal();
                return;
            }
            event.stopPropagation();
            const shareModal = button.nextElementSibling;
            shareModal.style.display = "block";

            const closeShareBtn = shareModal.querySelector(".share-close");
            closeShareBtn.onclick = function () {
                shareModal.style.display = "none";
            };

            window.onclick = function (event) {
                if (event.target == shareModal) {
                    shareModal.style.display = "none";
                }
            };
        });
    });
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

function showLoginWarningModal() {
    const warningModal = document.getElementById("loginWarningModal");
    warningModal.style.display = "block";
    warningModal.querySelector(".login-warning-close").onclick = function () {
        warningModal.style.display = "none";
    };
}

function updateLikeCountInDetailsModal(recipeName, likes) {
    const modal = document.querySelector(".recipe-details-modal");
    const recipeNameElement = modal.querySelector(".recipe-name");
    if (recipeNameElement.textContent === recipeName) {
        const likeCountElement = modal.querySelector(".like-count");
        likeCountElement.textContent = likes;
    }
}
