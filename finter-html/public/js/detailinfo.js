function showRecipeDetailsModal(recipe) {
    const modal = document.querySelector(".recipe-details-modal");
    document.querySelector(".recipe-name").textContent = recipe.name;
    document.querySelector(".recipe-details-filters .filter:nth-child(1)").textContent = recipe.time;
    document.querySelector(".recipe-details-filters .filter:nth-child(2)").textContent = recipe.category;
    document.querySelector(".recipe-details-image").src = `image/${recipe.image}`;
    document.querySelector(".recipe-ingredients p").textContent = recipe.material;
    document.querySelector(".recipe-instructions p").textContent = recipe.recipe;

    const nutritionText = `칼로리: ${recipe.nutrition ? recipe.nutrition.calories : 'N/A'}Kcal, 탄수화물: ${recipe.nutrition ? recipe.nutrition.carbohydrate : 'N/A'}g, 단백질: ${recipe.nutrition ? recipe.nutrition.protein : 'N/A'}g, 지방: ${recipe.nutrition ? recipe.nutrition.fat : 'N/A'}g, 당: ${recipe.nutrition ? recipe.nutrition.sugars : 'N/A'}g, 나트륨: ${recipe.nutrition ? recipe.nutrition.sodium : 'N/A'}g, 콜레스테롤: ${recipe.nutrition ? recipe.nutrition.cholesterol : 'N/A'}g, 포화 지방산: ${recipe.nutrition ? recipe.nutrition.saturatedFat : 'N/A'}g, 불포화 지방산: ${recipe.nutrition ? recipe.nutrition.transFat : 'N/A'}g`;
    const updatedAtText = `업데이트 날짜: ${recipe.updatedAt ? new Date(recipe.updatedAt).toLocaleString() : 'N/A'}`;

    let nutritionElement = document.querySelector(".recipe-nutrition");
    if (!nutritionElement) {
        nutritionElement = document.createElement("div");
        nutritionElement.classList.add("recipe-nutrition");
        modal.querySelector(".recipe-details-content").appendChild(nutritionElement);
    }
    nutritionElement.innerHTML = `<h3>영양정보</h3><p>${nutritionText}</p>`;

    let updatedAtElement = document.querySelector(".recipe-updated-at");
    if (!updatedAtElement) {
        updatedAtElement = document.createElement("div");
        updatedAtElement.classList.add("recipe-updated-at");
        modal.querySelector(".recipe-details-content").appendChild(updatedAtElement);
    }
    updatedAtElement.innerHTML = `<h3>업데이트한 시간</h3><p>${updatedAtText}</p>`;

    const commentList = document.querySelector(".comment-list");
    commentList.innerHTML = "";
    if (recipe.comments) {
        recipe.comments.forEach(comment => {
            const commentItem = document.createElement("div");
            commentItem.classList.add("comment-item");
            commentItem.innerHTML = `<p><strong>${comment.user}:</strong> ${comment.text}</p>`;
            commentList.appendChild(commentItem);
        });
    }

    const commentTextarea = document.querySelector("#commentTextarea");
    const commentSubmitBtn = document.querySelector(".comment-submit-btn");
    commentSubmitBtn.onclick = function () {
        const newComment = {
            user: window.currentUser.username,
            text: commentTextarea.value,
            date: new Date().toISOString()
        };

        fetch('/add-comment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                recipeName: recipe.name,
                comment: newComment.text,
                user: newComment.user
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const commentItem = document.createElement("div");
                commentItem.classList.add("comment-item");
                commentItem.innerHTML = `<p><strong>${newComment.user}:</strong> ${newComment.text}</p>`;
                commentList.appendChild(commentItem);
                commentTextarea.value = "";
                updateCommentCount(recipe.name); // 댓글 개수 업데이트 함수 호출
            } else {
                alert('댓글 저장에 실패했습니다.');
            }
        })
        .catch(error => console.error('Error adding comment:', error));
    };

    modal.style.display = "block";
}

function updateCommentCount(recipeName) {
    fetch(`/recipe-detail/${recipeName}`)
        .then(response => response.json())
        .then(recipe => {
            const recipeItems = document.querySelectorAll(".tm-list-item");
            recipeItems.forEach(item => {
                if (item.getAttribute('data-recipe-name') === recipeName) {
                    const commentCount = item.querySelector(".comment-count");
                    commentCount.textContent = recipe.commentCount;
                }
            });
        })
        .catch(error => console.error('Error updating comment count:', error));
}

function loadRecipeDetails(recipeName) {
    fetch(`/recipe-detail/${recipeName}`)
        .then(response => response.json())
        .then(data => {
            showRecipeDetailsModal(data);
        })
        .catch(error => console.error('Error loading the recipe details:', error));
}

document.querySelectorAll('.detail-button').forEach(button => {
    button.addEventListener('click', function() {
        const recipeName = this.getAttribute('data-recipe-name');
        loadRecipeDetails(recipeName);
    });
});

function showLoginWarningModal() {
    const warningModal = document.getElementById("loginWarningModal");
    warningModal.style.display = "block";
    warningModal.querySelector(".login-warning-close").onclick = function () {
        warningModal.style.display = "none";
    };
}
