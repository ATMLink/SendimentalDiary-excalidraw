"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/models/Tag.ts
const mongoose_1 = require("mongoose");
const tagSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true },
});
exports.default = (0, mongoose_1.model)('Tag', tagSchema);
