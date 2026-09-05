"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.historyRouter = void 0;
const express_1 = require("express");
const db_1 = require("../db");
exports.historyRouter = (0, express_1.Router)();
// GET /api/history
exports.historyRouter.get('/', (req, res) => {
    try {
        const { search, classification, threatType, limit, offset } = req.query;
        const result = (0, db_1.getAnalyses)({
            search: typeof search === 'string' ? search : undefined,
            classification: typeof classification === 'string' ? classification : undefined,
            threatType: typeof threatType === 'string' ? threatType : undefined,
            limit: limit ? parseInt(limit, 10) : 50,
            offset: offset ? parseInt(offset, 10) : 0
        });
        res.json(result);
    }
    catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Failed to retrieve analysis history.' });
    }
});
// GET /api/history/:id
exports.historyRouter.get('/:id', (req, res) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const analysis = (0, db_1.getAnalysisById)(id);
        if (!analysis) {
            res.status(404).json({ error: 'Analysis record not found.' });
            return;
        }
        res.json(analysis);
    }
    catch (error) {
        console.error('Error fetching analysis details:', error);
        res.status(500).json({ error: 'Failed to retrieve analysis record.' });
    }
});
// DELETE /api/history/:id
exports.historyRouter.delete('/:id', (req, res) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const success = (0, db_1.deleteAnalysis)(id);
        if (!success) {
            res.status(404).json({ error: 'Analysis record not found or already deleted.' });
            return;
        }
        res.json({ message: 'Analysis record deleted successfully.' });
    }
    catch (error) {
        console.error('Error deleting analysis record:', error);
        res.status(500).json({ error: 'Failed to delete record.' });
    }
});
// DELETE /api/history (Clear all history)
exports.historyRouter.delete('/', (_req, res) => {
    try {
        (0, db_1.clearAnalyses)();
        res.json({ message: 'All analysis history cleared successfully.' });
    }
    catch (error) {
        console.error('Error clearing history:', error);
        res.status(500).json({ error: 'Failed to clear analysis history.' });
    }
});
