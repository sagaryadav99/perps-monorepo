import { useEffect, useRef } from "react";
import {
  CandlestickSeries,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type Time,
} from "lightweight-charts";

export type Candle = {
  bucket: string;
  open: number | string;
  high: number | string;
  low: number | string;
  close: number | string;
};

export function CandleChart({ data }: { data: Candle[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const chartRef = useRef<IChartApi | null>(null);

  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  // Create chart
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,

      layout: {
        background: {
          color: "#12161F",
        },
        textColor: "#7C8598",
      },

      grid: {
        vertLines: {
          color: "#1E2530",
        },
        horzLines: {
          color: "#1E2530",
        },
      },

      rightPriceScale: {
        borderColor: "#232A38",
      },

      timeScale: {
        borderColor: "#232A38",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#34D399",
      downColor: "#F87171",
      borderUpColor: "#34D399",
      borderDownColor: "#F87171",
      wickUpColor: "#34D399",
      wickDownColor: "#F87171",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    // Resize chart when container changes size
    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current) return;

      chart.applyOptions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();

      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // Update candle data
  useEffect(() => {
    if (!seriesRef.current || data.length === 0) {
      return;
    }

    const candles: CandlestickData<Time>[] = data
      .map((candle) => ({
        time: Math.floor(new Date(candle.bucket).getTime() / 1000) as Time,

        open: Number(candle.open),
        high: Number(candle.high),
        low: Number(candle.low),
        close: Number(candle.close),
      }))
      .sort((a, b) => Number(a.time) - Number(b.time));

    seriesRef.current.setData(candles);

    chartRef.current?.timeScale().fitContent();
  }, [data]);

  return <div ref={containerRef} className="h-full w-full" />;
}
