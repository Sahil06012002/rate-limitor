"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const proxyController_1 = require("../controllers/proxyController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateApiKey);
router.all('/:appId/*', proxyController_1.proxyRequest);
exports.default = router;
