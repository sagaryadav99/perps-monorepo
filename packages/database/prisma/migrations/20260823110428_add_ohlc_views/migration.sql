-- DropIndex
DROP INDEX "PriceUpdates_timestamp_idx";
-- 1 minute candles
CREATE MATERIALIZED VIEW "Candles1m" AS
SELECT
    time_bucket('1 minute', "timestamp") AS bucket,
    symbol,
    first(price, "timestamp") AS open,
    max(price) AS high,
    min(price) AS low,
    last(price, "timestamp") AS close
FROM "PriceUpdates"
GROUP BY bucket, symbol;

-- 5 minute candles
CREATE MATERIALIZED VIEW "Candles5m" AS
SELECT
    time_bucket('5 minutes', "timestamp") AS bucket,
    symbol,
    first(price, "timestamp") AS open,
    max(price) AS high,
    min(price) AS low,
    last(price, "timestamp") AS close
FROM "PriceUpdates"
GROUP BY bucket, symbol;

-- 10 minute candles
CREATE MATERIALIZED VIEW "Candles10m" AS
SELECT
    time_bucket('10 minutes', "timestamp") AS bucket,
    symbol,
    first(price, "timestamp") AS open,
    max(price) AS high,
    min(price) AS low,
    last(price, "timestamp") AS close
FROM "PriceUpdates"
GROUP BY bucket, symbol;

-- 30 minute candles
CREATE MATERIALIZED VIEW "Candles30m" AS
SELECT
    time_bucket('30 minutes', "timestamp") AS bucket,
    symbol,
    first(price, "timestamp") AS open,
    max(price) AS high,
    min(price) AS low,
    last(price, "timestamp") AS close
FROM "PriceUpdates"
GROUP BY bucket, symbol;