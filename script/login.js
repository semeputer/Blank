function getFingerprint() {
  return [
    navigator.userAgent,
    screen.width + "x" + screen.height,
    navigator.language,
    window.devicePixelRatio
  ].join("|");
}

function attemptLogin() {
  const uname = document.getElementById("username").value.trim();
  const pword = document.getElementById("password").value.trim();
  const fingerprint = getFingerprint();

  Papa.parse("users.csv", {
    download: true,
    header: true,
    complete: function(results) {
      const users = results.data;
      const match = users.find(u => u.username === uname && u.password === pword);

      if (!match) {
        showError("Invalid username or password.");
        return;
      }

      const storedKey = `fp_${uname}`;
      const storedFingerprint = localStorage.getItem(storedKey);

      if (!storedFingerprint) {
        localStorage.setItem(storedKey, fingerprint);
      } else if (storedFingerprint !== fingerprint) {
        showError("Access denied: login from another device.");
        return;
      }

      sessionStorage.setItem("loggedInUser", uname);
      window.location.href = "map.html";
    }
  });
}

function showError(msg) {
  document.getElementById("error").textContent = msg;
}
