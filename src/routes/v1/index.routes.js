const express = require("express");

const indexController = require("../../controllers/index.controller");
const authRoutes = require("./auth.routes");
const categoryRoutes = require("./category.routes");

const router = express.Router();

router.get("/", indexController.home);

router.use("/auth", authRoutes);

router.use("/categories", categoryRoutes);

module.exports = router;