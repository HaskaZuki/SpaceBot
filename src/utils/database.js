const fs = require('fs');
const path = require('path');
const DATA_DIR = path.join(__dirname, '../../data');
const connectDB = async () => {
    try {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        console.log('JSON Database Ready: data folder initialized');
    } catch (error) {
        console.error(`Database Error: ${error.message}`);
        process.exit(1);
    }
};
module.exports = connectDB;
