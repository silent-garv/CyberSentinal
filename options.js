/* options.js */
document.getElementById("save").onclick = () => {
  const settings = {
    urlCheck: document.getElementById("urlCheck").checked,
    ipCheck: document.getElementById("ipCheck").checked,
    emailCheck: document.getElementById("emailCheck").checked,
    logging: document.getElementById("logging").checked
  };
  chrome.storage.sync.set(settings, () => alert("Settings saved!"));
};