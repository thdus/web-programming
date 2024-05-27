document.addEventListener("DOMContentLoaded", function () {
    const userIdField = document.getElementById("userId");
    if (window.currentUser) {
      userIdField.value = window.currentUser.username;
    }
  });