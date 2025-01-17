"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateApiKey = void 0;
const supabase_1 = require("../config/supabase");
const logger_1 = __importDefault(require("../config/logger"));
const authenticateApiKey = async (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'];
        if (!apiKey) {
            return res.status(401).json({ error: 'API key is required' });
        }
        const { data: user, error } = await supabase_1.supabase
            .from('users')
            .select('*')
            .eq('api_key', apiKey)
            .single();
        if (error || !user) {
            return res.status(401).json({ error: 'Invalid API key' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        logger_1.default.error('Authentication error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.authenticateApiKey = authenticateApiKey;
