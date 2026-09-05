"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statsRouter = void 0;
const express_1 = require("express");
const db_1 = require("../db");
exports.statsRouter = (0, express_1.Router)();
// GET /api/stats
exports.statsRouter.get('/', (_req, res) => {
    try {
        const stats = (0, db_1.getStats)();
        res.json(stats);
    }
    catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to retrieve dashboard metrics.' });
    }
});
