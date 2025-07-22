// 1. Importações
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// 2. Inicialização do App
const app = express();

// Configuração de CORS
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
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

// 4. Schemas e Modelos
const musicaSchema = new mongoose.Schema({
  titulo: String, artista: String, tempo: String, momento: String, tom: String,
  downloadUrl: String, letraUrl: String, cifraUrl: String, imageUrl: String, previewUrl: String
});
const Musica = mongoose.model('Musica', musicaSchema, 'musicas');

// --- CORREÇÃO: Schema e Modelo para os Destaques ---
const destaqueSchema = new mongoose.Schema({
    slides: [{
        imageUrl: String,
        linkUrl: String // Opcional
    }]
});
const Destaque = mongoose.model('Destaque', destaqueSchema); // O nome do modelo deve ser singular

// --- ROTAS DA API ---

// Rota GET para buscar os slides
app.get('/api/destaques', async (req, res) => {
    try {
        let destaquesDoc = await Destaque.findOne({});
        if (!destaquesDoc) {
            // Se não existir, retorna um array vazio para não dar erro no frontend
            return res.json([]); 
        }
        res.json(destaquesDoc.slides);
    } catch (error) {
        console.error("Erro ao buscar destaques:", error);
        res.status(500).json({ message: 'Erro ao buscar destaques.' });
    }
});

// Rota POST para atualizar os slides
app.post('/api/destaques', async (req, res) => {
    try {
        const { slides } = req.body;
        if (!Array.isArray(slides)) {
            return res.status(400).json({ message: 'O corpo da requisição deve conter um array de slides.' });
        }
        // Encontra o documento de destaques e o atualiza, ou cria se não existir.
        await Destaque.findOneAndUpdate({}, { slides: slides }, { upsert: true, new: true });
        res.status(200).json({ message: 'Destaques atualizados com sucesso!' });
    } catch (error) {
        console.error("Erro ao atualizar destaques:", error);
        res.status(500).json({ message: 'Erro ao atualizar destaques.' });
    }
});

// Rota GET para buscar músicas para o site principal
app.get('/api/musicas', async (req, res) => {
  const { tempo, momento } = req.query;
  if (!tempo || !momento) {
    return res.status(400).json({ message: 'Parâmetros "tempo" e "momento" são obrigatórios.' });
  }
  try {
    const resultado = await Musica.find({
      tempo: new RegExp('^' + tempo + '$', 'i'),
      momento: new RegExp('^' + momento + '$', 'i')
    });
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Rota POST para SALVAR músicas
app.post('/api/musicas', async (req, res) => {
  try {
    const novaMusica = new Musica(req.body);
    await novaMusica.save();
    res.status(201).json({ message: 'Música salva com sucesso!', data: novaMusica });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao salvar no banco de dados.' });
  }
});

// Rota GET para buscar TODAS as músicas para o painel de admin
app.get('/api/musicas/all', async (req, res) => {
  try {
    const todasAsMusicas = await Musica.find({}).sort({ tempo: 1, momento: 1, titulo: 1 });
    res.json(todasAsMusicas);
  } catch (error) {
    console.error("ERRO DETALHADO AO BUSCAR TUDO:", error);
    res.status(500).json({ message: 'Erro ao buscar todas as músicas.', error_details: error.message });
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

// Rota PUT para ATUALIZAR uma música por ID
app.put('/api/musicas/:id', async (req, res) => {
  try {
    const musicaAtualizada = await Musica.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!musicaAtualizada) return res.status(404).json({ message: 'Música não encontrada para atualizar.' });
    res.json({ message: 'Música atualizada com sucesso!', data: musicaAtualizada });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar no banco de dados.' });
  }
});

// Rota DELETE para excluir uma música
app.delete('/api/musicas/:id', async (req, res) => {
  try {
    const resultado = await Musica.findByIdAndDelete(req.params.id);
    if (!resultado) return res.status(404).json({ message: 'Música não encontrada.' });
    res.json({ message: 'Música excluída com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir música.' });
  }
});

// Rota POST para validar o login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASSWORD) {
    res.status(200).json({ message: 'Login bem-sucedido!' });
  } else {
    res.status(401).json({ message: 'Usuário ou senha inválidos.' });
  }
});

// Iniciar o Servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}.`);
});
