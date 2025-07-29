const express = require("express");
const router = express.Router();
const {
  criarMusica,
  listarMusicas,
  atualizarMusica,
  deletarMusica
} = require("../controllers/musicaController");

// Rotas da API
router.get("/", listarMusicas);
router.post("/", criarMusica);
router.put("/:id", atualizarMusica);
router.delete("/:id", deletarMusica);

module.exports = router;
