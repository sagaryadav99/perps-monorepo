-- CreateTable
CREATE TABLE "PriceUpdates" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL,
    "symbol" TEXT NOT NULL,
    "price" DECIMAL(30,10) NOT NULL,

    CONSTRAINT "PriceUpdates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PriceUpdates_symbol_timestamp_idx" ON "PriceUpdates"("symbol", "timestamp");
