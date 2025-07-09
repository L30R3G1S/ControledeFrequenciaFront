const inputs = document.querySelectorAll(".input-field");

inputs.forEach((inp) => {
  inp.addEventListener("focus", () => {
    inp.classList.add("active");
  });
  inp.addEventListener("blur", () => {
    if (inp.value != "") return;
    inp.classList.remove("active");
  });
});

// login.js
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (token) {
    // Se já estiver logado, manda direto pra home
    window.location.href = "home.html";
    return;
  }

  const form = document.getElementById("loginForm");
  const errorMsg = document.getElementById("errorMessage");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const response = await fetch("https://controledefrequencia.onrender.com/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login: username,     // <- backend espera 'login'
          password: password
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        window.location.href = "home.html"; // redireciona após login
      } else {
        errorMsg.textContent = "Usuário ou senha incorretos.";
        errorMsg.style.display = "block";
      }
    } catch (err) {
      console.error("Erro:", err);
      errorMsg.textContent = "Erro ao conectar com o servidor.";
      errorMsg.style.display = "block";
    }
  });
});




