// --- LÓGICA COMPLETA E FINAL PARA O PAINEL DE ADMIN ---

if (sessionStorage.getItem('isAuthenticated') !== 'true') {
    alert('Acesso negado. Por favor, faça o login.');
    window.location.href = 'login.html';
}

const momentosPorCategoria = {
    'Missa': ['Entrada', 'Ato Penitencial', 'Glória', 'Salmo', 'Aclamação', 'Ofertório', 'Santo', 'Cordeiro', 'Comunhão', 'Final'],
    'Grupo de Oração': ['Animação', 'Louvor', 'Espírito Santo', 'Adoração', 'Perdão', 'Pós-pregação', 'Mariana'],
    'Casamento': ['Entrada do Noivo', 'Entrada da Noiva', 'Bênção das Alianças', 'Comunhão', 'Assinaturas', 'Saída']
};
const temposLiturgicos = ['Advento', 'Natal', 'Quaresma', 'Páscoa', 'Tempo Comum', 'Corpus Christi', 'Pentecostes'];
const API_URL = 'https://biblioteca-musical-catolica.onrender.com';

function logout() { sessionStorage.removeItem('isAuthenticated'); window.location.href = 'login.html'; }
function formatarTexto(str) { if (!str) return ''; return str.trim().split(' ').map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase()).join(' '); }

function popularSelectDeMomentos(categoria, selectElementId) {
    const selectMomento = document.getElementById(selectElementId);
    if (!selectMomento) return;
    selectMomento.innerHTML = '';
    let momentos = [];
    if (temposLiturgicos.includes(categoria)) {
        momentos = momentosPorCategoria['Missa'];
    } else {
        momentos = momentosPorCategoria[categoria] || [];
    }
    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "Selecione um momento";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    selectMomento.appendChild(defaultOption);
    momentos.forEach(momento => {
        const option = document.createElement('option');
        option.value = momento;
        option.textContent = momento;
        selectMomento.appendChild(option);
    });
}

function showTab(event, tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
    if (tabName === 'manage') loadMusicList();
    else if (tabName === 'slider') criarInputsSlider();
}

async function loadMusicList() {
    const tableBody = document.querySelector('#music-table tbody');
    tableBody.innerHTML = '<tr><td colspan="4">Carregando...</td></tr>';
    try {
        const response = await fetch(`${API_URL}/api/musicas/all`);
        const musicas = await response.json();
        tableBody.innerHTML = '';
        musicas.forEach(musica => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${musica.titulo}</td><td>${musica.tempo}</td><td>${musica.momento}</td><td class="actions"><button class="btn-edit" onclick="editMusic('${musica._id}')">Editar</button><button class="btn-delete" onclick="deleteMusic('${musica._id}')">Excluir</button></td>`;
            tableBody.appendChild(row);
        });
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="4" style="color: red;">${error.message}</td></tr>`;
    }
}

async function deleteMusic(id) {
    if (!confirm('Tem certeza que deseja excluir esta música?')) return;
    try {
        await fetch(`${API_URL}/api/musicas/${id}`, { method: 'DELETE' });
        loadMusicList();
    } catch (error) {
        alert('Erro ao excluir a música.');
    }
}

const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-music-form');
function closeEditModal() { editModal.style.display = 'none'; }

async function editMusic(id) {
    try {
        const response = await fetch(`${API_URL}/api/musicas/${id}`);
        const musica = await response.json();
        editForm.innerHTML = `<input type="hidden" id="edit-id" value="${musica._id}"><div class="form-group"><label for="edit-titulo">Título</label><input type="text" id="edit-titulo" value="${musica.titulo || ''}" required></div><div class="form-group"><label for="edit-artista">Artista</label><input type="text" id="edit-artista" value="${musica.artista || ''}"></div><div class="form-group"><label for="edit-tempo">Tempo/Categoria</label><select id="edit-tempo" required></select></div><div class="form-group"><label for="edit-momento">Momento</label><select id="edit-momento" required></select></div><div class="form-group"><label for="edit-tom">Tom</label><input type="text" id="edit-tom" value="${musica.tom || ''}"></div><div class="form-group"><label for="edit-downloadUrl">Link de Download (Multitrack)</label><input type="url" id="edit-downloadUrl" value="${musica.downloadUrl || ''}" required></div><div class="form-group"><label for="edit-letraUrl">Link da Letra</label><input type="url" id="edit-letraUrl" value="${musica.letraUrl || ''}"></div><div class="form-group"><label for="edit-cifraUrl">Link da Cifra</label><input type="url" id="edit-cifraUrl" value="${musica.cifraUrl || ''}"></div><button type="submit">Salvar Alterações</button>`;
        const tempoSelect = document.getElementById('edit-tempo');
        const todasCategorias = [...temposLiturgicos, ...Object.keys(momentosPorCategoria).filter(k => k !== 'Missa')];
        const categoriasUnicas = [...new Set(todasCategorias)];
        categoriasUnicas.forEach(t => {
            const option = document.createElement('option');
            option.value = t;
            option.textContent = t;
            if (t === musica.tempo) option.selected = true;
            tempoSelect.appendChild(option);
        });
        popularSelectDeMomentos(tempoSelect.value, 'edit-momento');
        document.getElementById('edit-momento').value = musica.momento;
        tempoSelect.addEventListener('change', () => popularSelectDeMomentos(tempoSelect.value, 'edit-momento'));
        editModal.style.display = 'block';
    } catch (error) {
        alert(error.message);
    }
}

editForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const id = document.getElementById('edit-id').value;
    const dadosAtualizados = {
        titulo: formatarTexto(document.getElementById('edit-titulo').value),
        artista: formatarTexto(document.getElementById('edit-artista').value),
        tempo: document.getElementById('edit-tempo').value,
        momento: formatarTexto(document.getElementById('edit-momento').value),
        tom: document.getElementById('edit-tom').value.trim().toUpperCase(),
        downloadUrl: document.getElementById('edit-downloadUrl').value.trim(),
        letraUrl: document.getElementById('edit-letraUrl').value.trim(),
        cifraUrl: document.getElementById('edit-cifraUrl').value.trim(),
    };
    try {
        const response = await fetch(`${API_URL}/api/musicas/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dadosAtualizados) });
        if (!response.ok) throw new Error('Falha ao salvar as alterações.');
        closeEditModal();
        loadMusicList();
        alert('Música atualizada com sucesso!');
    } catch (error) {
        alert(error.message);
    }
});

function criarInputsSlider() {
    const container = document.getElementById('slider-inputs');
    if (container.innerHTML !== '') return;
    for (let i = 1; i <= 6; i++) {
        const div = document.createElement('div');
        div.className = 'form-group slider-group';
        div.innerHTML = `<label>Slide ${i}</label><input type="url" id="slide-image-url-${i}" placeholder="URL da Imagem"><input type="url" id="slide-link-url-${i}" placeholder="URL do Link (opcional)">`;
        container.appendChild(div);
    }
    carregarSlidesAtuais();
}

async function carregarSlidesAtuais() {
    try {
        const response = await fetch(`${API_URL}/api/destaques`);
        const slides = await response.json();
        slides.forEach((slide, index) => {
            const imgInput = document.getElementById(`slide-image-url-${index + 1}`);
            const linkInput = document.getElementById(`slide-link-url-${index + 1}`);
            if (imgInput) imgInput.value = slide.imageUrl;
            if (linkInput) linkInput.value = slide.linkUrl || '';
        });
    } catch (error) {
        console.error('Erro ao carregar slides:', error);
    }
}

document.getElementById('slider-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const slidesParaSalvar = [];
    for (let i = 1; i <= 6; i++) {
        const imgInput = document.getElementById(`slide-image-url-${i}`);
        const linkInput = document.getElementById(`slide-link-url-${i}`);
        if (imgInput && imgInput.value.trim() !== '') {
            slidesParaSalvar.push({ imageUrl: imgInput.value.trim(), linkUrl: linkInput.value.trim() });
        }
    }
    try {
        const response = await fetch(`${API_URL}/api/destaques`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slides: slidesParaSalvar }) });
        if (!response.ok) throw new Error('Falha ao salvar os slides.');
        alert('Slides atualizados com sucesso!');
    } catch (error) {
        alert(error.message);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const addForm = document.getElementById('add-music-form');
    const tempoSelectAdd = document.getElementById('add-tempo');
    const messageDiv = document.createElement('div');
    messageDiv.style.marginTop = '1rem';
    addForm.after(messageDiv);
    const todasCategorias = [...temposLiturgicos, ...Object.keys(momentosPorCategoria).filter(k => k !== 'Missa')];
    const categoriasUnicas = [...new Set(todasCategorias)];
    categoriasUnicas.forEach(t => {
        const option = document.createElement('option');
        option.value = t;
        option.textContent = t;
        tempoSelectAdd.appendChild(option);
    });
    tempoSelectAdd.addEventListener('change', () => {
        popularSelectDeMomentos(tempoSelectAdd.value, 'add-momento');
    });
    addForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        messageDiv.style.display = 'none';
        const musica = {
            titulo: formatarTexto(document.getElementById('add-titulo').value),
            artista: formatarTexto(document.getElementById('add-artista').value),
            tempo: document.getElementById('add-tempo').value,
            momento: formatarTexto(document.getElementById('add-momento').value),
            tom: document.getElementById('add-tom').value.trim().toUpperCase(),
            downloadUrl: document.getElementById('add-downloadUrl').value.trim(),
            letraUrl: document.getElementById('add-letraUrl').value.trim(),
            cifraUrl: document.getElementById('add-cifraUrl').value.trim(),
        };
        try {
            const response = await fetch(`${API_URL}/api/musicas`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(musica) });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Erro desconhecido.');
            messageDiv.textContent = 'Música salva com sucesso!';
            messageDiv.style.color = 'green';
            addForm.reset();
        } catch (error) {
            messageDiv.textContent = `Erro: ${error.message}`;
            messageDiv.style.color = 'red';
        } finally {
            messageDiv.style.display = 'block';
        }
    });
});
