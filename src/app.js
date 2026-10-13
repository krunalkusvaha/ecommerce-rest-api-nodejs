const express = require("express");

const indexRoutes = require("./routes/v1/index.routes");

const notFoundMiddleware = require("./middlewares/notFound.middleware");

const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

app.use(express.json());

app.use(express.urlencoded({extended: true,}));

/*
|--------------------------------------------------------------------------
| Public Uploads
|--------------------------------------------------------------------------
*/

app.use("/uploads",express.static("uploads"));

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use("/api/v1",indexRoutes);

/*
|--------------------------------------------------------------------------
| 404
|--------------------------------------------------------------------------
*/

app.use(notFoundMiddleware);

/*
|--------------------------------------------------------------------------
| Error Handler
|--------------------------------------------------------------------------
*/

app.use(errorMiddleware);

module.exports = app;