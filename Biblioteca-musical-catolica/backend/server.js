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
  .catch((err) => console.error('--- ERRO CRÍTICO DE CONEXÃO COM O MONGODB ---', err));

// 4. Definição dos Schemas e Modelos
const musicaSchema = new mongoose.Schema({
  titulo: String,
  artista: String,
  tempo: String,
  momento: String,
  tom: String,
  downloadUrl: String,
  letraUrl: String,
  cifraUrl: String,
  imageUrl: String,
  previewUrl: String
});
const Musica = mongoose.model('Musica', musicaSchema, 'musicas');

const destaqueSchema = new mongoose.Schema({
  slides: [{
    imageUrl: String,
    linkUrl: String
  }]
});
const Destaque = mongoose.model('Destaque', destaqueSchema);

// --- ROTAS ---

// Rota para buscar todas as músicas (usada no painel de admin)
app.get('/api/musicas/all', async (req, res) => {
  try {
    const musicas = await Musica.find().sort({ titulo: 1 });
    res.json(musicas);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar todas as músicas.' });
  }
});

// Rota para buscar músicas por categoria e momento (usada na biblioteca)
app.get('/api/musicas', async (req, res) => {
  const { tempo, momento } = req.query;
  try {
    const query = {};
    if (tempo) query.tempo = tempo;
    if (momento) query.momento = momento;
    const musicas = await Musica.find(query);
    res.json(musicas);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar músicas.' });
  }
});

// Rota para buscar uma música específica por ID (usada para edição)
app.get('/api/musicas/:id', async (req, res) => {
  try {
    const musica = await Musica.findById(req.params.id);
    if (!musica) return res.status(404).json({ message: 'Música não encontrada.' });
    res.json(musica);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar a música.' });
  }
});

// Rota para criar uma nova música
app.post('/api/musicas', async (req, res) => {
  try {
    const novaMusica = new Musica(req.body);
    await novaMusica.save();
    res.status(201).json(novaMusica);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao salvar a música.', error });
  }
});

// Rota para atualizar uma música
app.put('/api/musicas/:id', async (req, res) => {
  try {
    const musicaAtualizada = await Musica.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!musicaAtualizada) return res.status(404).json({ message: 'Música não encontrada para atualizar.' });
    res.json(musicaAtualizada);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao atualizar a música.', error });
  }
});

// Rota para deletar uma música
app.delete('/api/musicas/:id', async (req, res) => {
  try {
    const musicaDeletada = await Musica.findByIdAndDelete(req.params.id);
    if (!musicaDeletada) return res.status(404).json({ message: 'Música não encontrada para deletar.' });
    res.json({ message: 'Música deletada com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar a música.' });
  }
});

// ==================================================================
// == ROTA FALTANTE PARA O REPERTÓRIO ALEATÓRIO ==
// ==================================================================
app.get('/api/repertorio-aleatorio', async (req, res) => {
  const { tempo } = req.query;
  const ordemMomentosMissa = ['Entrada', 'Ato Penitencial', 'Glória', 'Salmo', 'Aclamação', 'Ofertório', 'Santo', 'Cordeiro', 'Comunhão', 'Final'];

  if (!tempo) {
    return res.status(400).json({ message: 'O parâmetro "tempo" é obrigatório.' });
  }

  try {
    const repertorio = {};
    for (const momento of ordemMomentosMissa) {
      // Conta quantos documentos existem para a combinação tempo/momento
      const count = await Musica.countDocuments({ tempo: tempo, momento: momento });
      if (count > 0) {
        // Se houver músicas, busca uma aleatória
        const random = Math.floor(Math.random() * count);
        const musicaAleatoria = await Musica.findOne({ tempo: tempo, momento: momento }).skip(random);
        repertorio[momento] = musicaAleatoria;
      } else {
        // Se não houver, define como null
        repertorio[momento] = null;
      }
    }
    res.json(repertorio);
  } catch (error) {
    console.error(`Erro ao gerar repertório para ${tempo}:`, error);
    res.status(500).json({ message: 'Erro interno ao gerar repertório.' });
  }
});

// Rota para Destaques (Slider)
app.get('/api/destaques', async (req, res) => {
  try {
    const destaque = await Destaque.findOne();
    res.json(destaque ? destaque.slides : []);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar destaques.' });
  }
});

app.post('/api/destaques', async (req, res) => {
  try {
    await Destaque.deleteMany({}); // Apaga os slides antigos
    if (req.body.slides && req.body.slides.length > 0) {
      const novoDestaque = new Destaque({ slides: req.body.slides });
      await novoDestaque.save();
    }
    res.status(200).json({ message: 'Destaques atualizados.' });
  } catch (error) {
    res.status(400).json({ message: 'Erro ao salvar destaques.', error });
  }
});

// Rota de Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Credenciais inválidas' });
  }
});

// 5. Iniciar o Servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}.`);
});
