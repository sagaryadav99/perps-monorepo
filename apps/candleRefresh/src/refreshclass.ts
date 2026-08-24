import { prisma } from "@repo/db";

abstract class Refresh {
  abstract refresh(): Promise<void>;
}
class Oneminute extends Refresh {
  private prev: number;
  constructor() {
    super();
    this.prev = Date.now();
  }
  override async refresh() {
    let now = Date.now();
    if (now - this.prev >= 60 * 1000) {
      await prisma.$executeRaw`
    REFRESH MATERIALIZED VIEW "Candles1m"
  `;
      this.prev = Date.now();
      console.log("executed 1m");
    } else {
      return;
    }
  }
}
class Fiveminute extends Refresh {
  private prev: number;
  constructor() {
    super();
    this.prev = Date.now();
  }
  override async refresh() {
    let now = Date.now();
    if (now - this.prev >= 5 * 60 * 1000) {
      await prisma.$executeRaw`
    REFRESH MATERIALIZED VIEW "Candles5m"
  `;
      this.prev = Date.now();
      console.log("executed 5 minutes");
    } else {
      return;
    }
  }
}
class Tenminute extends Refresh {
  private prev: number;
  constructor() {
    super();
    this.prev = Date.now();
  }
  override async refresh() {
    let now = Date.now();
    if (now - this.prev >= 10 * 60 * 1000) {
      await prisma.$executeRaw`
    REFRESH MATERIALIZED VIEW "Candles10m"
  `;
      this.prev = Date.now();
      console.log("executed ten minutes");
    } else {
      return;
    }
  }
}
class Thirtyminute extends Refresh {
  private prev: number;
  constructor() {
    super();
    this.prev = Date.now();
  }
  override async refresh() {
    let now = Date.now();
    if (now - this.prev >= 30 * 60 * 1000) {
      await prisma.$executeRaw`
    REFRESH MATERIALIZED VIEW "Candles30m"
  `;
      this.prev = Date.now();
      console.log("executed 30 minutes");
    } else {
      return;
    }
  }
}
class Cleanup extends Refresh {
  private prev: number;

  constructor() {
    super();
    this.prev = Date.now();
  }

  override async refresh() {
    const now = Date.now();

    if (now - this.prev < 60 * 60 * 1000) {
      return;
    }

    await prisma.$executeRaw`
      DELETE FROM "PriceUpdates"
      WHERE "timestamp" < NOW() - INTERVAL '1 day'
    `;

    this.prev = Date.now();

    console.log("cleaned old price updates");
  }
}
export const oneminute = new Oneminute();
export const fiveminute = new Fiveminute();
export const tenminute = new Tenminute();
export const thirtyminute = new Thirtyminute();
export const cleanup = new Cleanup();
