const puppeteer = require("puppeteer");

(async () => { 
  console.log("?? Launching Puppeteer Multiplayer Server...");

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath(),
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage"
    ]
  });

  const page = await browser.newPage();

  console.log("?? Loading the OvO Multiplayer page...");
  await page.goto('https://helendesp.github.io/test/classic/', { timeout: 0 });

  // Handle popups (dismiss alerts, etc.)
  page.on('dialog', async (dialog) => {
    await dialog.dismiss();
  });

  // Wait for the mod loader to be ready
  await page.waitForSelector('#ovo-modloader-toggle-button', { timeout: 0 });

  console.log("?? Injecting multiplayer mod...");
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

  console.log("?? Creating multiplayer room...");
  const roomId = await page.evaluate(() => {
    ovoMultiplayerClient.setUsername("Server");
    ovoMultiplayerClient.createRoom();
    return ovoMultiplayerClient.peer.id;  // Return room ID
  });

  console.log(`? Multiplayer room created! Players can join with room ID: ${roomId}`);

  // Keep the Puppeteer process alive
  await new Promise(() => {});
})();
