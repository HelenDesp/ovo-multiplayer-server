const puppeteer = require("puppeteer"); 
const { execSync } = require("child_process");

// Install Chrome before launching Puppeteer
execSync("npx puppeteer browsers install chrome", { stdio: "inherit" });


(async () => { 
  console.log("🚀 Launching Puppeteer Multiplayer Server...");

  const browser = await puppeteer.launch({
    headless: true, // Set to false if you want to see the browser UI
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  console.log("🌍 Loading the OvO Multiplayer page...");
  await page.goto('https://ovo-modded.netlify.app/1.4.4/index.html', { timeout: 0 });

  // Handle popups (dismiss alerts, etc.)
  page.on('dialog', async (dialog) => {
    await dialog.dismiss();
  });

  // Wait for the mod loader to be ready
  await page.waitForSelector('#ovo-modloader-toggle-button', { timeout: 0 });

  console.log("🔗 Injecting multiplayer mod...");
  await page.evaluate(() => {
    return new Promise((resolve) => {
      let js = document.createElement('script');
      js.type = 'application/javascript';
      js.src = 'https://ovo-mods.glitch.me/multiplayer.js';
      js.onload = resolve;  // Ensure the script is loaded before continuing
      document.head.appendChild(js);
    });
  });

  // Wait for multiplayer UI to appear
  await page.waitForSelector('#ovo-multiplayer-toggle-button', { timeout: 0 });

  // Wait until multiplayer client is fully loaded
  await page.waitForFunction(() => typeof window.ovoMultiplayerClient !== "undefined", { timeout: 0 });

  console.log("🎮 Creating multiplayer room...");
  const roomId = await page.evaluate(() => {
    ovoMultiplayerClient.setUsername("Server");
    ovoMultiplayerClient.createRoom();
    return ovoMultiplayerClient.peer.id;  // Return room ID
  });

  console.log(`✅ Multiplayer room created! Players can join with room ID: ${roomId}`);

  // Keep the Puppeteer process alive
  await new Promise(() => {});
})();
