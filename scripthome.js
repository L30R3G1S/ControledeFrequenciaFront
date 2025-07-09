// check-auth.js
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "index.html"; // sem token, volta pro login
    return;
  }

  fetch("https://controledefrequencia.onrender.com/login", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  })
    .then((res) => {
      if (!res.ok) {
        console.warn("Token inválido.");
        localStorage.removeItem("token");
        window.location.href = "index.html";
      }
    })
    .catch(() => {
      console.error("Erro ao verificar token.");
      localStorage.removeItem("token");
      window.location.href = "index.html";
    });
});

// Função global de logout
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
} 


const uploadBox = document.getElementById("uploadBox");
const fileInput = document.getElementById("fileInput");
const tabelaCorpo = document.getElementById("tabela-corpo");

// Clique na área abre o seletor
uploadBox.addEventListener("click", () => fileInput.click());

// Drag and drop visual
uploadBox.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadBox.classList.add("dragover");
});
uploadBox.addEventListener("dragleave", () => uploadBox.classList.remove("dragover"));
uploadBox.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadBox.classList.remove("dragover");
  if(e.dataTransfer.files.length) {
    processarArquivo(e.dataTransfer.files[0]);
  }
});

// Ao selecionar arquivo via input
fileInput.addEventListener("change", (e) => {
  if(e.target.files.length) {
    processarArquivo(e.target.files[0]);
  }
});

// Função para ler arquivo e enviar para backend
function processarArquivo(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);

    // Envia dados para backend Java
    fetch('/api/importar-planilha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(json)
    })
    .then(response => {
      if (!response.ok) throw new Error("Erro no envio dos dados");
      return response.json();
    })
    .then(data => {
      alert('Importação concluída com sucesso!');
      carregarTabelaDoBanco(); // Atualiza tabela com dados do backend
    })
    .catch(error => {
      console.error(error);
      alert('Erro ao importar dados.');
    });
  };
  reader.readAsArrayBuffer(file);
}

// Função para buscar dados do backend e preencher a tabela
function carregarTabelaDoBanco() {
  const tabelaCorpo = document.getElementById("tabelaCorpo");
  if (!tabelaCorpo) return; // não executa se a tabela não está presente

  fetch('/api/listar-dados')
    .then(response => {
      if (!response.ok) throw new Error("Erro ao buscar dados");
      return response.json();
    })
    .then(dados => {
      dados.sort((a, b) => (b["Dias Trabalhados"] || 0) - (a["Dias Trabalhados"] || 0));
      tabelaCorpo.innerHTML = '';

      dados.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${item.Nome || ''}</td>
          <td>${item.CPF || ''}</td>
          <td>${item["Dias Trabalhados"] || 0}</td>
        `;
        tabelaCorpo.appendChild(tr);
      });
    })
    .catch(err => {
      console.error(err);
      alert('Erro ao carregar dados da tabela');
    });
}

// Só executa após o DOM carregar, e se houver a tabela
window.addEventListener("DOMContentLoaded", carregarTabelaDoBanco);



