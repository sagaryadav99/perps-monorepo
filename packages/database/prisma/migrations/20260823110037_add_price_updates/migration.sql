-- CreateTable
CREATE TABLE "PriceUpdates" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL,
    "symbol" TEXT NOT NULL,
    "price" DECIMAL(30,10) NOT NULL,

    CONSTRAINT "PriceUpdates_pkey" PRIMARY KEY ("id","timestamp")
);

-- CreateIndex
CREATE INDEX "PriceUpdates_symbol_timestamp_idx" ON "PriceUpdates"("symbol", "timestamp");

-- Enable TimescaleDB
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Convert PriceUpdates to a hypertable
SELECT create_hypertable(
    '"PriceUpdates"',
    by_range('timestamp')
);