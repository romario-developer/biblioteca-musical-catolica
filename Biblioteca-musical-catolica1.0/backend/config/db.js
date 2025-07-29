const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ Erro na conexão com o MongoDB:", err.message);
    process.exit(1); // Encerra a aplicação em caso de erro
  }
};

module.exports = connectDB;
