"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApps = exports.registerApp = void 0;
const uuid_1 = require("uuid");
const supabase_1 = require("../config/supabase");
const logger_1 = __importDefault(require("../config/logger"));
const zod_1 = require("zod");
const appSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    baseUrl: zod_1.z.string().url(),
    rateLimit: zod_1.z.number().positive(),
    timeWindow: zod_1.z.number().positive()
});
const registerApp = async (req, res) => {
    try {
        const validation = appSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: validation.error });
        }
        const { name, baseUrl, rateLimit, timeWindow } = validation.data;
        const userId = req.user.id;
        const { data, error } = await supabase_1.supabase
            .from('apps')
            .insert([{
                id: (0, uuid_1.v4)(),
                user_id: userId,
                name,
                base_url: baseUrl,
                rate_limit: rateLimit,
                time_window: timeWindow
            }])
            .select()
            .single();
        if (error)
            throw error;
        res.status(201).json({
            message: 'App registered successfully',
            app: data
        });
    }
    catch (error) {
        logger_1.default.error('App registration error:', error);
        res.status(500).json({ error: 'Failed to register app' });
    }
};
exports.registerApp = registerApp;
const getApps = async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabase
            .from('apps')
            .select('*')
            .eq('user_id', req.user.id);
        if (error)
            throw error;
        res.json({ apps: data });
    }
    catch (error) {
        logger_1.default.error('Get apps error:', error);
        res.status(500).json({ error: 'Failed to fetch apps' });
    }
};
exports.getApps = getApps;
