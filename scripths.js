const container = document.getElementById("historico-container");

async function carregarHistorico() {
  try {
    const res = await fetch("/api/historico-planilhas");

    if (!res.ok) {
      throw new Error("Falha na requisição: " + res.status);
    }

    const planilhas = await res.json();

    if (!Array.isArray(planilhas) || planilhas.length === 0) {
      container.innerHTML = '<p class="vazio">Nenhuma planilha encontrada.</p>';
      return;
    }

    const tabela = document.createElement("table");
    tabela.innerHTML = `
      <thead>
        <tr>
          <th>Arquivo</th>
          <th>Usuário</th>
          <th>Data/Hora</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        ${planilhas.map(p => `
          <tr>
            <td>${p.nomeArquivo}</td>
            <td>${p.usuario}</td>
            <td>${new Date(p.dataUpload).toLocaleString()}</td>
            <td>
              <a href="${p.urlDownload}" class="btn btn-baixar" download>Baixar</a>
              <button class="btn btn-excluir" onclick="excluirPlanilha(${p.id}, this)">Excluir</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    `;

    container.innerHTML = '';
    container.appendChild(tabela);
  } catch (err) {
    console.error("Erro ao carregar histórico:", err);
    container.innerHTML = '<p class="vazio">Erro ao carregar planilhas.</p>';
  }
}
