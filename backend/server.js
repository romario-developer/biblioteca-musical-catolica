// 1. Importações
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// 2. Inicialização do App
const app = express();
app.use(cors());
app.use(express.json());
const PORT = 3000;

// ... (O código de conexão e do Schema continua igual) ...
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado com sucesso ao MongoDB!'))
  .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

const musicaSchema = new mongoose.Schema({
  titulo: String,
  tempo: String,
  momento: String,
  downloadUrl: String,
  artista: String,
  tom: String
});
const Musica = mongoose.model('Musica', musicaSchema, 'musicas');


// 5. Rota GET para BUSCAR músicas (existente)
app.get('/api/musicas', async (req, res) => {
  // ... (seu código app.get continua aqui, sem alterações)
  const { tempo, momento } = req.query;
  if (!tempo || !momento) {
    return res.status(400).json({ message: 'Parâmetros "tempo" e "momento" são obrigatórios.' });
  }
  console.log(`Buscando no DB por tempo: "${tempo}" e momento: "${momento}"`);
  try {
    const resultado = await Musica.find({
      tempo: new RegExp('^' + tempo + '$', 'i'),
      momento: new RegExp('^' + momento + '$', 'i')
    });

    if (resultado.length === 0) {
      console.log('Nenhuma música encontrada para esta combinação.');
    } else {
      console.log(`Encontradas ${resultado.length} músicas.`);
    }
    res.json(resultado);
  } catch (error) {
    console.error('Erro ao buscar músicas no DB:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// NOVA ROTA POST PARA SALVAR MÚSICAS
app.post('/api/musicas', async (req, res) => {
  try {
    const novaMusica = new Musica({
      titulo: req.body.titulo,
      artista: req.body.artista,
      tempo: req.body.tempo,
      momento: req.body.momento,
      tom: req.body.tom,
      downloadUrl: req.body.downloadUrl,
    });

    await novaMusica.save(); // Salva o documento no MongoDB

    console.log('Nova música salva:', novaMusica.titulo);
    res.status(201).json({ message: 'Música salva com sucesso!', data: novaMusica });

  } catch (error) {
    console.error('Erro ao salvar nova música:', error);
    res.status(500).json({ message: 'Erro ao salvar no banco de dados.' });
  }
});

// ROTA GET para buscar TODAS as músicas para o painel de admin
app.get('/api/musicas/all', async (req, res) => {
  try {
    const todasAsMusicas = await Musica.find({});
    res.json(todasAsMusicas);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar todas as músicas.' });
  }
});

// ROTA DELETE para excluir uma música
app.delete('/api/musicas/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const resultado = await Musica.findByIdAndDelete(id);
    if (!resultado) {
      return res.status(404).json({ message: 'Música não encontrada.' });
    }
    res.json({ message: 'Música excluída com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir música.' });
  }
});

// ROTA GET para buscar UMA música por ID (para o formulário de edição)
app.get('/api/musicas/:id', async (req, res) => {
    try {
        const musica = await Musica.findById(req.params.id);
        if (!musica) {
            return res.status(404).json({ message: 'Música não encontrada.' });
        }
        res.json(musica);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar música.' });
    }
});

// ROTA PUT para ATUALIZAR uma música por ID
app.put('/api/musicas/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const dadosAtualizados = req.body;

        const musicaAtualizada = await Musica.findByIdAndUpdate(id, dadosAtualizados, { new: true });
        // { new: true } garante que a resposta retorne o documento já atualizado.

        if (!musicaAtualizada) {
            return res.status(404).json({ message: 'Música não encontrada para atualizar.' });
        }

        console.log('Música atualizada:', musicaAtualizada.titulo);
        res.json({ message: 'Música atualizada com sucesso!', data: musicaAtualizada });
    } catch (error) {
        console.error('Erro ao atualizar música:', error);
        res.status(500).json({ message: 'Erro ao atualizar no banco de dados.' });
    }
});

// ROTA POST para validar o login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // Busca as credenciais seguras do arquivo .env
    const adminUser = process.env.ADMIN_USER;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (username === adminUser && password === adminPassword) {
        // Login bem-sucedido
        console.log('Login bem-sucedido para o usuário:', username);
        res.status(200).json({ message: 'Login bem-sucedido!' });
    } else {
        // Credenciais inválidas
        console.log('Tentativa de login falhou para o usuário:', username);
        res.status(401).json({ message: 'Usuário ou senha inválidos.' });
    }
});


// 6. Iniciar o Servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}.`);
});
