const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    text: String,
    authorId: mongoose.Schema.Types.ObjectId,
    authorName: String,
    timestamp: { type: Date, default: Date.now },
});

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    desc: String,
    status: {type: String, default: 'Backlog'},
    due: Date,
    assigneeId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    comments: [CommentSchema],
});

module.exports = mongoose.model('Task', TaskSchema);