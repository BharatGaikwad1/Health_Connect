"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bloodController_1 = require("../controllers/bloodController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/:hospitalId', authMiddleware_1.authenticate, bloodController_1.getHospitalBlood);
router.put('/:hospitalId/:bloodGroup', authMiddleware_1.authenticate, bloodController_1.updateHospitalBlood);
exports.default = router;
