"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET = process.env.JWT_SECRET || 'dev_secret';
const authenticate = (req, res, next) => {
    var _a;
    const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
    if (!token)
        return res.status(401).json({ error: 'Access denied' });
    try {
        const verified = jsonwebtoken_1.default.verify(token, SECRET);
        req.user = verified;
        next();
    }
    catch (err) {
        res.status(400).json({ error: 'Invalid token' });
    }
};
exports.authenticate = authenticate;
