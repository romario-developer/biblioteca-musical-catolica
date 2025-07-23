// 1. Importações
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// 2. Inicialização do App
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3000;

// 3. Conexão com o Banco de Dados MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado com sucesso ao MongoDB!'))
  .catch((err) => {
    console.error('--- ERRO CRÍTICO DE CONEXÃO COM O MONGODB ---');
    console.error(err);
    console.error('---------------------------------------------');
  });

// 4. Definição dos Schemas e Modelos
const musicaSchema = new mongoose.Schema({
  titulo: String, artista: String, tempo: String, momento: String, tom: String,
  downloadUrl: String, letraUrl: String, cifraUrl: String, imageUrl: String, previewUrl: String
});
const Musica = mongoose.model('Musica', musicaSchema, 'musicas');

const destaqueSchema = new mongoose.Schema({
  slides: [{ imageUrl: String, linkUrl: String }]
});
const Destaque = mongoose.model('Destaque', destaqueSchema);

// --- ROTAS DE MÚSICAS ---

// Rota GET para BUSCAR músicas para o site principal (com paginação)
app.get('/api/musicas', async (req, res) => {
  const { tempo, momento, page = 1, limit = 5 } = req.query;
  if (!tempo || !momento) {
    return res.status(400).json({ message: 'Parâmetros "tempo" e "momento" são obrigatórios.' });
  }
  try {
    const query = {
      tempo: new RegExp('^' + tempo + '$', 'i'),
      momento: new RegExp('^' + momento + '$', 'i')
    };
    const musicas = await Musica.find(query).limit(limit * 1).skip((page - 1) * limit);
    const count = await Musica.countDocuments(query);
    res.json({ musicas, totalPages: Math.ceil(count / limit), currentPage: page });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Rota GET para buscar TODAS as músicas para o painel de admin
app.get('/api/musicas/all', async (req, res) => {
  try {
    const todasAsMusicas = await Musica.find({}).sort({ tempo: 1, momento: 1, titulo: 1 });
    res.json(todasAsMusicas);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar todas as músicas.' });
  }
});

// Rota GET para buscar UMA música por ID
app.get('/api/musicas/:id', async (req, res) => {
  try {
    const musica = await Musica.findById(req.params.id);
    if (!musica) return res.status(404).json({ message: 'Música não encontrada.' });
    res.json(musica);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar música.' });
  }
});

// Rota POST para SALVAR MÚSICAS
app.post('/api/musicas', async (req, res) => {
  try {
    const novaMusica = new Musica(req.body);
    await novaMusica.save();
    res.status(201).json({ message: 'Música salva com sucesso!', data: novaMusica });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao salvar no banco de dados.' });
  }
});

// ROTA PUT para ATUALIZAR uma música por ID
app.put('/api/musicas/:id', async (req, res) => {
  try {
    const musicaAtualizada = await Musica.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!musicaAtualizada) return res.status(404).json({ message: 'Música não encontrada para atualizar.' });
    res.json({ message: 'Música atualizada com sucesso!', data: musicaAtualizada });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar no banco de dados.' });
  }
});

// ROTA DELETE para excluir uma música
app.delete('/api/musicas/:id', async (req, res) => {
  try {
    const resultado = await Musica.findByIdAndDelete(req.params.id);
    if (!resultado) return res.status(404).json({ message: 'Música não encontrada.' });
    res.json({ message: 'Música excluída com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir música.' });
  }
});

// --- NOVA ROTA PARA MOMENTOS ---
app.get('/api/momentos', async (req, res) => {
  const { tempo } = req.query;
  if (!tempo) {
    return res.status(400).json({ message: 'Parâmetro "tempo" é obrigatório.' });
  }
  try {
    const momentos = await Musica.distinct('momento', {
      tempo: new RegExp('^' + tempo + '$', 'i')
    });
    res.json(momentos);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar momentos.' });
  }
});

// --- ROTAS DO SLIDER ---
app.get('/api/destaques', async (req, res) => {
  try {
    let destaques = await Destaque.findOne({});
    if (!destaques) {
      destaques = await new Destaque({ slides: [] }).save();
    }
    res.json(destaques.slides);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar destaques.' });
  }
});

app.post('/api/destaques', async (req, res) => {
  try {
    const { slides } = req.body;
    if (!Array.isArray(slides)) {
      return res.status(400).json({ message: 'O corpo da requisição deve conter um array de slides.' });
    }
    await Destaque.findOneAndUpdate({}, { slides: slides }, { upsert: true });
    res.status(200).json({ message: 'Destaques atualizados com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar destaques.' });
  }
});

// --- ROTA DE LOGIN ---
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASSWORD) {
    res.status(200).json({ message: 'Login bem-sucedido!' });
  } else {
    res.status(401).json({ message: 'Usuário ou senha inválidos.' });
  }
});

// 5. Iniciar o Servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}.`);
});
