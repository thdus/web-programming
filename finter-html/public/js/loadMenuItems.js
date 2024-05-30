document.addEventListener("DOMContentLoaded", function () {
    function loadMenuItems() {
        const menuContainer = document.querySelector("#customCarousel1 .tm-list");
        const timeSelect = document.getElementById("timeSelect");
        const categorySelect = document.getElementById("categorySelect");

        fetch("/menu-items")
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((menuItems) => {
                renderMenuItems(menuItems);

                // 시간 선택 이벤트 리스너 추가
                timeSelect.addEventListener("change", function () {
                    filterMenuItems(menuItems);
                });

                // 카테고리 선택 이벤트 리스너 추가
                categorySelect.addEventListener("change", function () {
                    filterMenuItems(menuItems);
                });
            })
            .catch((error) => console.error("Error loading the menu items:", error));
    }

    function filterMenuItems(menuItems) {
        const selectedTime = document.getElementById("timeSelect").value;
        const selectedCategory = document.getElementById("categorySelect").value;

        const filteredItems = menuItems.filter(item => {
            const timeMatch = selectedTime === "" || item.time === selectedTime;
            const categoryMatch = selectedCategory === "" || item.category === selectedCategory;
            return timeMatch && categoryMatch;
        });

        renderMenuItems(filteredItems);
    }

    function renderMenuItems(menuItems) {
        const menuContainer = document.querySelector("#customCarousel1 .tm-list");
        menuContainer.innerHTML = "";
        menuItems.forEach((item) => {
            const liked = window.currentUser && window.currentUser.likedRecipes && window.currentUser.likedRecipes.includes(item.name);
            const heartClass = liked ? "fa-heart" : "fa-heart-o";
    
            const menuItemHtml = `
                <div class="tm-list-item" data-item='${JSON.stringify(item)}' data-recipe-name="${item.name}">
                    <img src="image/${item.image}" alt="${item.name}" class="tm-list-item-img">
                    <div class="tm-list-item-content">
                        <div class="tm-list-item-header">
                            <h3 class="tm-list-item-name">${item.name}</h3>
                            <div class="tm-list-item-filters">
                                <span class="filter">${item.time}</span>
                                <span class="filter">${item.category}</span>
                            </div>
                            <div class="tm-list-item-id-date">
                                <span class="tm-list-item-id">${item.userId || 'Unknown User'}/</span>
                                <span class="tm-list-item-date">${new Date(item.updatedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div class="tm-list-item-footer">
                            <button class="details-btn" data-recipe-name="${item.name}">상세 정보</button>
                            <div class="tm-list-item-actions">
                                <button class="like-btn"><i class="fa ${heartClass}" aria-hidden="true"></i></button>
                                <span class="like-count">${item.likes || 0}</span>
                                <button class="comment-btn" data-recipe-name="${item.name}">
                                    <i class="fa fa-comment"></i>
                                </button>
                                <span class="comment-count">${item.commentCount || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>`;
            menuContainer.innerHTML += menuItemHtml;
        });
    
        attachEventListeners();
    }    

    function attachEventListeners() {
        setDetailButtonEventListeners();
        setCommentButtonEventListeners();
        window.setButtonEventListeners(); // 전역 함수 호출
    }

    function setDetailButtonEventListeners() {
        document.querySelectorAll(".details-btn").forEach(button => {
            button.addEventListener("click", function(event) {
                event.stopPropagation();
                const recipeName = button.getAttribute("data-recipe-name");
                loadRecipeDetails(recipeName);
            });
        });
    }

    function setCommentButtonEventListeners() {
        document.querySelectorAll(".comment-btn").forEach(button => {
            button.addEventListener("click", function(event) {
                if (!window.currentUser) {
                    showLoginWarningModal();
                    return;
                }
                event.stopPropagation();
                const recipeName = button.getAttribute("data-recipe-name");
                loadComments(recipeName);
            });
        });
    }

    function loadRecipeDetails(recipeName) {
        fetch(`/recipe-detail/${recipeName}`)
            .then(response => response.json())
            .then(data => {
                showRecipeDetailsModal(data);
            })
            .catch(error => console.error('Error loading the recipe details:', error));
    }

    function loadComments(recipeName) {
        fetch(`/recipe-detail/${recipeName}`)
            .then(response => response.json())
            .then(data => {
                showCommentsModal(data.comments);
            })
            .catch(error => console.error('Error loading comments:', error));
    }

    function showCommentsModal(comments) {
        const modal = document.getElementById("commentModal");
        const commentList = document.getElementById("commentList");
        commentList.innerHTML = "";

        if (comments && comments.length > 0) {
            comments.forEach(comment => {
                const commentItem = document.createElement("div");
                commentItem.classList.add("comment-item");
                commentItem.innerHTML = `<p><strong>${comment.user}:</strong> ${comment.text}</p>`;
                commentList.appendChild(commentItem);
            });
        } else {
            commentList.innerHTML = "<p>댓글이 없습니다.</p>";
        }

        const closeModalBtn = modal.querySelector(".close");
        closeModalBtn.onclick = function() {
            modal.style.display = "none";
        };

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        };

        modal.style.display = "block";
    }

    loadMenuItems();
});
