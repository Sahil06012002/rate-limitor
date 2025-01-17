"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const uuid_1 = require("uuid");
const supabase_1 = require("../config/supabase");
const logger_1 = __importDefault(require("../config/logger"));
const register = async (req, res) => {
    try {
        const apiKey = (0, uuid_1.v4)();
        const { data, error } = await supabase_1.supabase
            .from('users')
            .insert([{ api_key: apiKey }])
            .select()
            .single();
        if (error)
            throw error;
        res.status(201).json({
            message: 'Registration successful',
            api_key: apiKey
        });
    }
    catch (error) {
        logger_1.default.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register' });
    }
};
exports.register = register;
