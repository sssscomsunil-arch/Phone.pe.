const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Demo-only code
const DEMO_CODE = "6789";

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post("/api/verify-code", (req, res) => {
  const code = String(req.body?.code || "").trim();

  res.json({
    valid: code === DEMO_CODE
  });
});

app.listen(PORT, () => {
  console.log(`Demo server running on port ${PORT}`);
});
