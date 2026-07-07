// medusa-toggle.mjs — arm/disarm the time-boxed Medusa admin window.
// Used by:  npm run medusa:unlock | medusa:lock | medusa:status
import fs from "node:fs";

const ARM = ".medusa-admin.armed";
const WINDOW_MIN = 30;
const cmd = process.argv[2] || "status";
const now = Math.floor(Date.now() / 1000);

if (cmd === "unlock") {
  const exp = now + WINDOW_MIN * 60;
  fs.writeFileSync(ARM, String(exp));
  console.log(
    `🔓 Medusa admin ARMED for ${WINDOW_MIN} min (auto-locks at ${new Date(exp * 1000).toLocaleTimeString()}).`
  );
} else if (cmd === "lock") {
  try { fs.unlinkSync(ARM); } catch {}
  console.log("🔒 Medusa admin LOCKED.");
} else {
  if (!fs.existsSync(ARM)) { console.log("🔒 LOCKED"); process.exit(0); }
  const exp = parseInt(fs.readFileSync(ARM, "utf8"), 10) || 0;
  const left = exp - now;
  if (left <= 0) { try { fs.unlinkSync(ARM); } catch {}; console.log("🔒 LOCKED (window expired)"); }
  else console.log(`🔓 ARMED — ${Math.ceil(left / 60)} min left`);
}
