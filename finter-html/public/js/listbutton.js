document.addEventListener("DOMContentLoaded", function () {
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
    }

    function updateLikeCountInDetailsModal(recipeName, likes) {
        const modal = document.querySelector(".recipe-details-modal");
        const recipeNameElement = modal.querySelector(".recipe-name");
        if (recipeNameElement.textContent === recipeName) {
            const likeCountElement = modal.querySelector(".like-count");
            likeCountElement.textContent = likes;
        }
    }

    setButtonEventListeners();
});
