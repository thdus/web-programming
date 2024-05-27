// 메뉴 항목 필터링
document.addEventListener("DOMContentLoaded", function () {
    function filterMenuItems(menuItems) {
        const foodValue = document.getElementById("foodInput").value.trim().toLowerCase();
        const timeValue = document.getElementById("timeSelect").value;
        const categoryValue = document.getElementById("categorySelect").value;

        return menuItems.filter(item => {
            const matchesFood = !foodValue || item.name.toLowerCase().includes(foodValue);
            const matchesTime = !timeValue || item.time === timeValue;
            const matchesCategory = !categoryValue || item.category === categoryValue;
            return matchesFood && matchesTime && matchesCategory;
        });
    }

    function displayMenuItems(filteredItems) {
        const menuContainer = document.querySelector("#customCarousel1 .tm-list");
        menuContainer.innerHTML = ""; // 기존 내용 초기화
        filteredItems.forEach((item) => {
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
                                <span class="tm-list-item-id">ID: ${item.userId}/</span>
                                <span class="tm-list-item-date">${new Date(item.updatedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div class="tm-list-item-footer">
                            <button class="details-btn">상세 정보</button>
                            <div class="tm-list-item-actions">
                                <button class="like-btn" ${!window.currentUser ? 'disabled' : ''}>
                                    <i class="fa fa-heart"></i>
                                </button>
                                <span class="like-count">0</span>
                                <button class="comment-btn" ${!window.currentUser ? 'disabled' : ''}>
                                    <i class="fa fa-comment"></i>
                                </button>
                                <span class="comment-count">0</span>
                                <div class="comment-list-modal">
                                    <div class="comment-list-content">
                                        <span class="comment-list-close">&times;</span>
                                        <div class="comment-list">
                                            <h3>댓글</h3>
                                            <p>댓글이 없습니다.</p>
                                        </div>
                                        <textarea placeholder="댓글을 입력하세요"></textarea>
                                        <button class="comment-submit-btn" ${!window.currentUser ? 'disabled' : ''}>댓글 달기</button>
                                    </div>
                                </div>
                                <button class="share-btn" ${!window.currentUser ? 'disabled' : ''}>
                                    <i class="fa fa-share"></i>
                                </button>
                                <div id="shareModal" class="modal">
                                    <div class="modal-content">
                                        <span class="share-close">&times;</span>
                                        <h2>공유하기</h2>
                                        <form class="shareForm">
                                            <label for="recipient-email">이메일 주소:</label>
                                            <input type="email" id="recipient-email" name="recipient-email" placeholder="이메일 주소 입력">
                                            <button type="submit" class="share-submit-btn">보내기</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
            menuContainer.innerHTML += menuItemHtml;
        });

        attachEventListeners();
    }

    function loadFilteredMenuItems() {
        fetch("/menu-items")
            .then((response) => response.json())
            .then((menuItems) => {
                const filteredItems = filterMenuItems(menuItems);
                displayMenuItems(filteredItems);
            })
            .catch((error) => console.error("Error loading the menu items:", error));
    }

    // 검색 버튼 클릭 시 필터링된 결과 표시
    const searchButton = document.querySelector(".nav_search-btn");
    searchButton.addEventListener("click", function (event) {
        event.preventDefault(); // 기본 제출 행위 방지
        loadFilteredMenuItems(); // 메뉴 항목 로드 및 필터링된 결과 표시
    });
});
