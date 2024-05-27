
  document.addEventListener("DOMContentLoaded", function() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser) {
      document.getElementById("userIdInput").value = currentUser.username;
    }
  });

