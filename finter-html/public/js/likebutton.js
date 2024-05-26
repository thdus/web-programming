document.addEventListener("DOMContentLoaded", function () {
    function setButtonEventListeners() {
        // 좋아요 버튼 클릭 이벤트 설정
        document.querySelectorAll(".like-btn").forEach(button => {
            button.addEventListener("click", function (event) {
                if (!window.currentUser) {
                    showLoginWarningModal();
                    return;
                }
                event.stopPropagation();
                const listItem = button.closest(".tm-list-item");
                const itemData = JSON.parse(listItem.getAttribute("data-item"));

                // 서버에 좋아요 수 토글 요청
                fetch("/toggle-like-recipe", {
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
                        itemData.likes = data.likes;
                        listItem.querySelector(".like-count").textContent = itemData.likes;
                        updateLikeCountInDetailsModal(itemData.name, data.likes);

                        // 좋아요 버튼 아이콘 변경
                        const heartIcon = button.querySelector("i");
                        if (data.liked) {
                            heartIcon.classList.remove("fa-heart-o");
                            heartIcon.classList.add("fa-heart");
                        } else {
                            heartIcon.classList.remove("fa-heart");
                            heartIcon.classList.add("fa-heart-o");
                        }
                    }
                })
                .catch(error => console.error("Error toggling like:", error));
            });
        });
    }

    function updateLikeCountInDetailsModal(recipeName, likes) {
        const modal = document.querySelector(".recipe-details-modal");
        const recipeNameElement = modal.querySelector(".recipe-name");
        if (recipeNameElement && recipeNameElement.textContent === recipeName) {
            const likeCountElement = modal.querySelector(".like-count");
            if (likeCountElement) {
                likeCountElement.textContent = likes;
            }
        }
    }

    setButtonEventListeners();

    // 다른 스크립트 파일에서도 사용 가능하도록 함수를 window 객체에 할당
    window.setButtonEventListeners = setButtonEventListeners;
});
