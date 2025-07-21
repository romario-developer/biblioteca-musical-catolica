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

// 4. Definição do Schema e do Modelo da Música
const musicaSchema = new mongoose.Schema({
  titulo: String,
  artista: String,
  tempo: String,
  momento: String,
  tom: String,
  downloadUrl: String,
  letraUrl: String,      // Campo já estava aqui, o que é bom
  cifraUrl: String,      // Campo já estava aqui, o que é bom
  imageUrl: String,
  previewUrl: String
});
const Musica = mongoose.model('Musica', musicaSchema, 'musicas');

// 5. Rota GET para BUSCAR músicas para o site principal
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

// 6. Rota POST para SALVAR MÚSICAS (CORRIGIDA)
app.post('/api/musicas', async (req, res) => {
  try {
    const novaMusica = new Musica({
      titulo: req.body.titulo,
      artista: req.body.artista,
      tempo: req.body.tempo,
      momento: req.body.momento,
      tom: req.body.tom,
      downloadUrl: req.body.downloadUrl,
      letraUrl: req.body.letraUrl,      // <-- CORREÇÃO: Adicionado
      cifraUrl: req.body.cifraUrl,      // <-- CORREÇÃO: Adicionado
      imageUrl: req.body.imageUrl,
      previewUrl: req.body.previewUrl
    });
    await novaMusica.save();
    res.status(201).json({ message: 'Música salva com sucesso!', data: novaMusica });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao salvar no banco de dados.' });
  }
});

// 7. Rota GET para buscar TODAS as músicas para o painel de admin
app.get('/api/musicas/all', async (req, res) => {
  try {
    const todasAsMusicas = await Musica.find({}).sort({ tempo: 1, momento: 1, titulo: 1 });
    res.json(todasAsMusicas);
  } catch (error) {
    console.error("ERRO DETALHADO AO BUSCAR TUDO:", error);
    res.status(500).json({ message: 'Erro ao buscar todas as músicas.', error_details: error.message });
  }
});

// 8. Rota GET para buscar UMA música por ID
app.get('/api/musicas/:id', async (req, res) => {
  try {
    const musica = await Musica.findById(req.params.id);
    if (!musica) return res.status(404).json({ message: 'Música não encontrada.' });
    res.json(musica);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar música.' });
  }
});

// 9. ROTA PUT para ATUALIZAR uma música por ID (CORRIGIDA)
app.put('/api/musicas/:id', async (req, res) => {
  try {
    // O req.body já contém todos os campos do formulário, incluindo letraUrl e cifraUrl.
    // O Mongoose é inteligente o suficiente para atualizar apenas os campos presentes.
    const dadosAtualizados = req.body; 

    const musicaAtualizada = await Musica.findByIdAndUpdate(req.params.id, dadosAtualizados, { new: true });
    if (!musicaAtualizada) return res.status(404).json({ message: 'Música não encontrada para atualizar.' });
    res.json({ message: 'Música atualizada com sucesso!', data: musicaAtualizada });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar no banco de dados.' });
  }
});

// 10. ROTA DELETE para excluir uma música
app.delete('/api/musicas/:id', async (req, res) => {
  try {
    const resultado = await Musica.findByIdAndDelete(req.params.id);
    if (!resultado) return res.status(404).json({ message: 'Música não encontrada.' });
    res.json({ message: 'Música excluída com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir música.' });
  }
});

// 11. ROTA POST para validar o login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASSWORD) {
    res.status(200).json({ message: 'Login bem-sucedido!' });
  } else {
    res.status(401).json({ message: 'Usuário ou senha inválidos.' });
  }
});

// 12. Iniciar o Servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}.`);
});
