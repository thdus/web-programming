document.addEventListener("DOMContentLoaded", function () {
    function loadMenuItems() {
      fetch("/menu-items")
        .then(response => response.json())
        .then(menuItems => renderMenuItems(menuItems))
        .catch(error => console.error("Error loading the menu items:", error));
    }
  
    function renderMenuItems(menuItems) {
      const menuContainer = document.querySelector("#customCarousel1 .tm-list");
      menuContainer.innerHTML = "";
      menuItems.forEach(item => {
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
                  <span class="tm-list-item-date">${new Date(item.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div class="tm-list-item-footer">
                <button class="details-btn" data-recipe-id="${item.id}">상세 정보</button>
                <div class="tm-list-item-actions">
                  <button class="like-btn"><i class="fa fa-heart-o" aria-hidden="true"></i></button>
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
      window.setButtonEventListeners();
    }
  
    loadMenuItems();
  });
  