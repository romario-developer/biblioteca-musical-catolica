const mongoose = require("mongoose");

const musicaSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  autor: {
    type: String,
    trim: true
  },
  tempoLiturgico: {
    type: String,
    enum: ["Advento", "Natal", "Quaresma", "Páscoa", "Tempo Comum", "Pentecostes", "Outro"],
    default: "Outro"
  },
  parteDaMissa: {
    type: String,
    enum: ["Entrada", "Ato Penitencial", "Glória", "Aclamação", "Ofertório", "Santo", "Comunhão", "Final", "Outro"],
    default: "Outro"
  },
  linkYoutube: {
    type: String
  },
  letra: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Musica", musicaSchema);
