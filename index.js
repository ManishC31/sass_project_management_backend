import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";

/**
 * Run the server
 */
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
