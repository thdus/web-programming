// 음식 이름 : foodNameInput
// 조리 시간 : select : cookingTimeoption | 5~30분, 1시간 이상
// 음식 종류 : select : foodCategory | 한식,중식,일식,양식, 기타
// 재료 : material
// 레시피 : recipe
// 음식사진 : uploadPhoto

document.addEventListener("DOMContentLoaded", function () {
  const menuContainer = document.querySelector("#customCarousel1 .tm-list"); // id 선택자 사용

  function fetchMenuItems() {
    fetch("/menu-items")
      .then((response) => response.json())
      .then((menuItems) => {
        menuItems.forEach((item) => {
          const menuItemHtml = `
                    <div class="tm-list-item">          
                        <img src="images/${item.image}" alt="Image" class="tm-list-item-img">
                        <div class="tm-black-bg tm-list-item-text">
                            <h3 class="tm-list-item-name">${item.name}<span class="tm-list-item-price">${item.price}</span></h3>
                            <p class="tm-list-item-description">${item.recipe}</p>
                        </div>
                    </div>`;
          menuContainer.innerHTML += menuItemHtml;
        });
      })
      .catch((error) => console.error("Error loading the menu items:", error));
  }

  fetchMenuItems(); // 페이지 로딩 시 메뉴 아이템 로드
});

document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  form.addEventListener("submit", function (event) {
    // event.preventDefault();
    const formData = new FormData(form);

    fetch("/upload-data", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        // 성공 메시지를 받고 나면,
        fetchMenuItems(); // 메뉴 아이템을 새로고침할 수 있도록 설정
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred while uploading data");
      });
  });

  function fetchMenuItems() {
    fetch("/menu-items")
      .then((response) => response.text())
      .then((html) => {
        document.querySelector(".tm-list").innerHTML = html; // 화면에 새로운 메뉴 아이템을 표시
      })
      .catch((error) => {
        console.error("Error loading menu items:", error);
      });
  }
});
