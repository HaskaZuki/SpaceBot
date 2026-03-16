const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true, index: true },
    visiblePlaylists: { type: Boolean, default: true }
}, {
    timestamps: true
});
module.exports = mongoose.model('User', UserSchema);
