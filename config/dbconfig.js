

const mongoose = require('mongoose');

const dbconnect = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}
module.exports = dbconnect;