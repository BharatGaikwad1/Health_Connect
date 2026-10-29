"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const hospitalRoutes_1 = __importDefault(require("./routes/hospitalRoutes"));
const bedRoutes_1 = __importDefault(require("./routes/bedRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const bloodRoutes_1 = __importDefault(require("./routes/bloodRoutes"));
const navigationRoutes_1 = __importDefault(require("./routes/navigationRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/auth', authRoutes_1.default);
app.use('/api/hospitals', hospitalRoutes_1.default);
app.use('/api/beds', bedRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
app.use('/api/blood', bloodRoutes_1.default);
app.use('/api/navigation', navigationRoutes_1.default);
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-connect-new';
mongoose_1.default.connect(MONGODB_URI)
    .then(() => {
    console.log('Connected to MongoDB');
    app.listen(Number(PORT), '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
})
    .catch(err => console.error(err));
