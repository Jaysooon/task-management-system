const mongoose = require('mongoose');


const RegistrationSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Registration', RegistrationSchema);