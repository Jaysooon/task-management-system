const bcrypt = require("bcrypt");

(async () => {
  const password = "admin123"; // pick your real password
  const hash = await bcrypt.hash(password, 10);
  console.log("Hashed password:", hash);
})();