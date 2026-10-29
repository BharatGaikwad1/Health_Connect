"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const navigationController_1 = require("../controllers/navigationController");
const router = (0, express_1.Router)();
// Public emergency routing: patient navigation requests should not be blocked by token expiry
router.get('/directions', navigationController_1.getDirections);
exports.default = router;
