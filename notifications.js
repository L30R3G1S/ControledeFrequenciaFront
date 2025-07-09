let todasNotificacoes = [];
let filtroAtual = "todas";

const container = document.getElementById("notificacoes-container");

async function carregarNotificacoes() {
  try {
    const resposta = await fetch("/api/notificacoes");
    const notificacoes = await resposta.json();
    todasNotificacoes = notificacoes;
    renderizarNotificacoes();
  } catch (err) {
    console.error("Erro ao carregar:", err);
    container.innerHTML = '<p class="vazio">Erro ao carregar notificações.</p>';
  }
}

function renderizarNotificacoes() {
  container.innerHTML = "";

  const lista =
    filtroAtual === "todas"
      ? todasNotificacoes
      : todasNotificacoes.filter((n) => n.tipo === filtroAtual);

  if (lista.length === 0) {
    container.innerHTML =
      '<p class="vazio">Nenhuma notificação encontrada.</p>';
    return;
  }

  lista.forEach((n) => {
    const div = document.createElement("div");
    div.className = `notificacao ${n.tipo} ${n.lida ? "lida" : ""}`;

    let titulo = "🔔 Notificação";
    if (n.tipo === "importacao")
      titulo = `📥 Planilha Importada por ${n.usuario}`;
    if (n.tipo === "alerta6dias")
      titulo = "⚠️ Funcionário com 6 dias trabalhados";
    if (n.tipo === "alerta7dias")
      titulo = "🚨 Funcionário com 7 dias consecutivos";

    div.innerHTML = `
          <h3>${titulo}</h3>
          <p>${n.mensagem}</p>
          <small>${new Date(n.data).toLocaleString()}</small>
          ${
            !n.lida
              ? `<button class="marcar-lida" onclick="marcarComoLida(${n.id}, this)">Marcar como lida</button>`
              : ""
          }
        `;

    container.appendChild(div);
  });
}

function filtrar(tipo) {
  filtroAtual = tipo;
  document
    .querySelectorAll(".filtros button")
    .forEach((btn) => btn.classList.remove("ativo"));
  document
    .querySelector(`.filtros button[onclick="filtrar('${tipo}')"]`)
    .classList.add("ativo");
  renderizarNotificacoes();
}

async function marcarComoLida(id, btn) {
  try {
    await fetch(`/api/notificacoes/${id}/marcar-como-lida`, {
      method: "POST",
    });
    const notif = todasNotificacoes.find((n) => n.id === id);
    if (notif) notif.lida = true;
    renderizarNotificacoes();
  } catch (err) {
    console.error("Erro ao marcar como lida:", err);
  }
}

window.addEventListener("DOMContentLoaded", carregarNotificacoes);
