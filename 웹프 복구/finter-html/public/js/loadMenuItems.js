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
            const liked = window.currentUser && window.currentUser.likedRecipes.includes(item.name);
            const heartClass = liked ? "fa-heart" : "fa-heart-o";
    
            const menuItemHtml = `
                <div class="tm-list-item" data-item='${JSON.stringify(item)}'>
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
                            <button class="details-btn" data-recipe-id="${item.id}">상세 정보</button>
                            <div class="tm-list-item-actions">
                                <button class="like-btn"><i class="fa ${heartClass}" aria-hidden="true"></i></button>
                                <span class="like-count">${item.likes || 0}</span>
                                <button class="comment-btn">
                                    <i class="fa fa-comment"></i>
                                </button>
                                <span class="comment-count">0</span>
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
        window.setButtonEventListeners(); // 전역 함수 호출
    }

    function setDetailButtonEventListeners() {
        document.querySelectorAll(".details-btn").forEach(button => {
            button.addEventListener("click", function(event) {
                if (!window.currentUser) {
                    showLoginWarningModal();
                    return;
                }
                event.stopPropagation();
                const listItem = button.closest(".tm-list-item");
                const itemData = JSON.parse(listItem.getAttribute("data-item"));
                showRecipeDetailsModal(itemData);
            });
        });
    }

    loadMenuItems();
});

