const body = document.querySelector("body"),
sidebar = body.querySelector(".sidebar"),
toggle = body.querySelector(".toggle"),
searchBtn = body.querySelector(".search-box"),
modeSwitch = body.querySelector(".mode"),
modeText = body.querySelector(".mode-text");



toggle.addEventListener("click",()=>{
    sidebar.classList.toggle("close");
});

searchBtn.addEventListener("click",()=>{
    sidebar.classList.remove("close");
});


// 🔁 1. Quando a página carregar, aplicar o modo salvo
window.addEventListener("DOMContentLoaded", () => {
  const darkModeAtivo = localStorage.getItem("modo-escuro") === "true";

  if (darkModeAtivo) {
    body.classList.add("dark");
    modeText.innerText = "Modo Claro";
  } else {
    body.classList.remove("dark");
    modeText.innerText = "Modo Escuro";
  }
});

// 🌗 2. Alternar o modo quando o usuário clicar
modeSwitch.addEventListener("click", () => {
  body.classList.toggle("dark");

  const darkAtivado = body.classList.contains("dark");

  modeText.innerText = darkAtivado ? "Modo Claro" : "Modo Escuro";

  // Salvar no localStorage
  localStorage.setItem("modo-escuro", darkAtivado);
});

 