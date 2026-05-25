// import dns from "dns";

// dns.setDefaultResultOrder("ipv4first");
import dotenv from "dotenv";
dotenv.config();
console.log(process.env.MONGODB_URI); 

import app from "./app";
import connectDB from "./config/db";


connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});