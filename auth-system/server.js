import app from "./app.js";
import { connectDB } from "./config/db.js";
import config from "./config/env.js";

const PORT = config.port;

connectDB();

app.listen(PORT, () => {
  console.log(`Auth server running on port ${PORT}`);
});
