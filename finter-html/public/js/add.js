document.addEventListener("DOMContentLoaded", function () {
    const userIdField = document.getElementById("userId");
    if (window.currentUser) {
      userIdField.value = window.currentUser.username;
    }
  });

  function redirectToContactPage() {
    if (!window.currentUser) {
        showLoginWarningModal();
    } else {
        window.location.href = "contact.html";
    }
}