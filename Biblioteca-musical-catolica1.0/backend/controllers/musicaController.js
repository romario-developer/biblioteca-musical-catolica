const Musica = require("../models/Musica");

// Criar nova música
const criarMusica = async (req, res) => {
  try {
    const novaMusica = await Musica.create(req.body);
    res.status(201).json(novaMusica);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
};

// Buscar todas as músicas
const listarMusicas = async (req, res) => {
  try {
    const musicas = await Musica.find().sort({ createdAt: -1 });
    res.json(musicas);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// Atualizar uma música
const atualizarMusica = async (req, res) => {
  try {
    const musicaAtualizada = await Musica.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(musicaAtualizada);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
};

// Deletar uma música
const deletarMusica = async (req, res) => {
  try {
    await Musica.findByIdAndDelete(req.params.id);
    res.json({ mensagem: "Música removida com sucesso." });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

module.exports = {
  criarMusica,
  listarMusicas,
  atualizarMusica,
  deletarMusica
};
