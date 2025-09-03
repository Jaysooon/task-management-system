require('dotenv').config();
const express = require("express");
const connectDB = require("./config/db");
const tasksRoutes = require("./routes/tasks");
const usersRoutes = require("./routes/users");
const registrationsRoutes = require("./routes/registration");
const cors = require("cors");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use("/tasks", tasksRoutes);
app.use("/users", usersRoutes);
app.use("/registrations", registrationsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
