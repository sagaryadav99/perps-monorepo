import { setTimeoutPromisified } from "@perps-monorepo/shared";
import {
  oneminute,
  fiveminute,
  tenminute,
  thirtyminute,
  cleanup,
} from "./refreshclass";
async function candleRefresh() {
  while (true) {
    try {
      await oneminute.refresh();
      await fiveminute.refresh();
      await tenminute.refresh();
      await thirtyminute.refresh();
      await cleanup.refresh();
    } catch (error) {
      console.error("Candle refresh worker error:", error);
    }
    await setTimeoutPromisified(60000);
  }
}
candleRefresh();
