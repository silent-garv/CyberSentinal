document.addEventListener("input", async (e) => {
  if (e.target && e.target.type === "email") {
    const email = e.target.value.trim().toLowerCase();
    if (email.includes("@")) {
      const hash = await sha1(email);
      const prefix = hash.slice(0, 5);
      const suffix = hash.slice(5);

      const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      const text = await res.text();
      if (text.includes(suffix.toUpperCase())) {
        alert("⚠ Email found in data breach! Consider changing your password.");
      }
    }
  }
});

async function sha1(str) {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}
