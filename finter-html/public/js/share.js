document.addEventListener("DOMContentLoaded", function () {
    function setShareButtonEventListeners() {
        document.querySelectorAll(".share-btn").forEach((button) => {
            button.addEventListener("click", function (event) {
                event.stopPropagation();
                const recipeName = button.getAttribute("data-recipe-name");
                document.getElementById("recipeName").value = recipeName;
                document.getElementById("shareModal").style.display = "block";
            });
        });
    }

    document.getElementById("shareForm").addEventListener("submit", function (event) {
        event.preventDefault();
        const recipientEmail = document.getElementById("recipientEmail").value;
        const recipeName = document.getElementById("recipeName").value;

        fetch("/share-recipe", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ recipientEmail, recipeName }),
        })
        .then((response) => response.text())
        .then((result) => {
            alert(result);
            document.getElementById("shareModal").style.display = "none";
        })
        .catch((error) => {
            console.error("Error sharing recipe:", error);
        });
    });

    document.querySelector(".share-close").onclick = function () {
        document.getElementById("shareModal").style.display = "none";
    };

    window.onclick = function (event) {
        if (event.target == document.getElementById("shareModal")) {
            document.getElementById("shareModal").style.display = "none";
        }
    };

    setShareButtonEventListeners();
});
