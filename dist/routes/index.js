"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const app_1 = __importDefault(require("./app"));
const proxy_1 = __importDefault(require("./proxy"));
const router = (0, express_1.Router)();
router.use('/auth', auth_1.default);
router.use('/apps', app_1.default);
router.use('/apis', proxy_1.default);
exports.default = router;
