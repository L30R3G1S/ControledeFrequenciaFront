const tabelaCorpo = document.getElementById("tabela-corpo");
const uploadBox = document.getElementById("uploadBox");
const fileInput = document.getElementById("fileInput");
const statusImportacao = document.getElementById("statusImportacao");
const ultimaImportacao = document.getElementById("ultimaImportacao");
const enviarBtn = document.getElementById("enviarArquivoBtn");


let arquivoSelecionado = null;
let mensagemTimeout = null;
const token = localStorage.getItem("token");

uploadBox.addEventListener("click", () => fileInput.click());

uploadBox.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadBox.classList.add("dragover");
});

uploadBox.addEventListener("dragleave", () => uploadBox.classList.remove("dragover"));

uploadBox.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadBox.classList.remove("dragover");
  if (e.dataTransfer.files.length) {
    arquivoSelecionado = e.dataTransfer.files[0];
    statusImportacao.textContent = `Arquivo pronto para envio: ${arquivoSelecionado.name}`;
    statusImportacao.style.color = "#333";
  }
});

fileInput.addEventListener("change", (e) => {
  clearTimeout(mensagemTimeout);
  if (e.target.files.length) {
    arquivoSelecionado = e.target.files[0];
    statusImportacao.textContent = `Arquivo pronto para envio: ${arquivoSelecionado.name}`;
    statusImportacao.style.color = "#333";
  }
});

enviarBtn.addEventListener("click", () => {
  if (!arquivoSelecionado) {
    alert("Por favor, selecione um arquivo antes de enviar.");
    return;
  }

  clearTimeout(mensagemTimeout);
  statusImportacao.textContent = "Enviando arquivo...";
  statusImportacao.style.color = "#333";
  enviarBtn.disabled = true;

  
function processarArquivo(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
   reader.onload = function (e) {
  try {
    console.log("🔄 Iniciando leitura do arquivo...");
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);

    console.log("✅ Planilha convertida:", json); // <-- veja o que foi gerado
   
    fetch('https://controledefrequencia.onrender.com/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` },
      body: JSON.stringify(json)
    })
    .then(response => {
      console.log(" Resposta do servidor:", response);
      if (!response.ok) throw new Error("Erro no envio dos dados");
      return response.json();
    })
    .then(() => resolve())
    .catch(err => {
      console.error(" Erro no fetch:", err);
      reject(err);
    });
  } catch (error) {
    console.error("Erro ao ler ou converter planilha:", error);
    reject(error);
  }
};
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

processarArquivo(arquivoSelecionado)
    .then(() => {
      statusImportacao.innerHTML = `✅ Arquivo <strong>${arquivoSelecionado.name}</strong> enviado com sucesso!`;
      statusImportacao.style.color = "green";
      fileInput.value = "";
      arquivoSelecionado = null;
      carregarTabelaDoBanco();

      mensagemTimeout = setTimeout(() => {
        statusImportacao.textContent = "";
      }, 7000);
    })
    .catch((error) => {
      console.error(error);
      statusImportacao.textContent = "ZZ Erro ao importar dados.";
      statusImportacao.style.color = "red";
    })
    .finally(() => {
      enviarBtn.disabled = false;
    });
});





const container = document.getElementById("historico-container");

async function carregarHistorico() {
  try {
    fetch('https://controledefrequencia.onrender.com/upload', {
      method: 'GET',
      headers: {'Authorization': `Bearer ${token}`}
    }).then(res => {
      
      if (!res.ok) {
      throw new Error("Falha na requisição: " + res.status);
      }
      var planilhas = res.json();

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
    
    }
      
    );

  } catch (err) {
    console.error("Erro ao carregar histórico:", err);
    container.innerHTML = '<p class="vazio">Erro ao carregar planilhas.</p>';
  }
}
