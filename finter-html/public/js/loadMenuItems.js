document.addEventListener("DOMContentLoaded", function () {
    function loadMenuItems() {
        const menuContainer = document.querySelector("#customCarousel1 .tm-list");

        fetch("/menu-items")
            .then((response) => response.json())
            .then((menuItems) => {
                menuContainer.innerHTML = "";
                menuItems.forEach((item) => {
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
                                        <span class="tm-list-item-id">${item.userId}/</span>
                                        <span class="tm-list-item-date">업데이트 날짜</span>
                                    </div>
                                </div>
                                <div class="tm-list-item-footer">
                                    <button class="details-btn">상세 정보</button>
                                    <div class="tm-list-item-actions">
                                        <button class="like-btn">
                                            <i class="fa fa-heart"></i>
                                        </button>
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
            })
            .catch((error) => console.error("Error loading the menu items:", error));
    }

    function attachEventListeners() {
        setDetailButtonEventListeners();
        setButtonEventListeners();
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
