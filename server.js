const express = require("express");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static("public"));

app.post("/login", (req, res) => {
  const { username, password, deviceFingerprint } = req.body;
  const users = [];

  fs.createReadStream("users.csv")
    .pipe(csv())
    .on("data", row => users.push(row))
    .on("end", () => {
      const user = users.find(u => u.username === username && u.password === password);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });

      // First-time login: record fingerprint
      if (!user.fingerprint) {
        user.fingerprint = JSON.stringify(deviceFingerprint);
      } else if (user.fingerprint !== JSON.stringify(deviceFingerprint)) {
        return res.status(403).json({ message: "Access denied from new device." });
      }

      user.Login_Date_Time = new Date().toISOString();

      // Rewrite CSV
      const header = "Name,username,password,Login_Date_Time,fingerprint\n";
      const rows = users.map(u =>
        `${u.Name},${u.username},${u.password},${u.Login_Date_Time || ""},${u.fingerprint || ""}`
      ).join("\n");

      fs.writeFileSync("users.csv", header + rows);

      res.json({ message: "Login successful" });
    });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
