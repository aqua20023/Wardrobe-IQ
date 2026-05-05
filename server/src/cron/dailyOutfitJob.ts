import cron from "node-cron";

export function scheduleDailyOutfitJob() {
  cron.schedule("0 7 * * *", () => {
    console.log("[cron] Daily outfit placeholder job executed. AI ranking is intentionally disabled for MVP.");
  });
}
