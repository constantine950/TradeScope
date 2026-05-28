"use client";
import { useEffect, useRef } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  UTCTimestamp,
  LineData,
} from "lightweight-charts";
import { BollingerPoint, IndicatorPoint } from "../../types/indicator";
import { Candle } from "../../types/candle";

interface IndicatorOverlayProps {
  sma?: IndicatorPoint[];
  ema?: IndicatorPoint[];
  bbands?: {
    upper: BollingerPoint[];
    middle: BollingerPoint[];
    lower: BollingerPoint[];
  };
}

interface Props {
  candles: Candle[];
  height?: number;
  indicators?: IndicatorOverlayProps;
  rsi?: IndicatorPoint[];
}

export default function CandlestickChart({
  candles,
  height = 500,
  indicators,
  rsi,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const rsiChartRef = useRef<IChartApi | null>(null);
  const rsiContainerRef = useRef<HTMLDivElement>(null);

  // Overlay series refs
  const smaSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const bbUpperRef = useRef<ISeriesApi<"Line"> | null>(null);
  const bbMiddleRef = useRef<ISeriesApi<"Line"> | null>(null);
  const bbLowerRef = useRef<ISeriesApi<"Line"> | null>(null);
  const rsiSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  // Create main chart
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: { background: { color: "#161b27" }, textColor: "#94a3b8" },
      grid: {
        vertLines: { color: "#2a3347" },
        horzLines: { color: "#2a3347" },
      },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: "#2a3347" },
      timeScale: {
        borderColor: "#2a3347",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    const volumeSeries = chart.addHistogramSeries({
      color: "#3b82f6",
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });
    chart
      .priceScale("volume")
      .applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });

    // Overlay series
    const smaSeries = chart.addLineSeries({
      color: "#f59e0b",
      lineWidth: 1,
      priceLineVisible: false,
    });
    const emaSeries = chart.addLineSeries({
      color: "#a78bfa",
      lineWidth: 1,
      priceLineVisible: false,
    });
    const bbUpper = chart.addLineSeries({
      color: "#60a5fa",
      lineWidth: 1,
      lineStyle: 2,
      priceLineVisible: false,
    });
    const bbMiddle = chart.addLineSeries({
      color: "#60a5fa",
      lineWidth: 1,
      priceLineVisible: false,
    });
    const bbLower = chart.addLineSeries({
      color: "#60a5fa",
      lineWidth: 1,
      lineStyle: 2,
      priceLineVisible: false,
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;
    smaSeriesRef.current = smaSeries;
    emaSeriesRef.current = emaSeries;
    bbUpperRef.current = bbUpper;
    bbMiddleRef.current = bbMiddle;
    bbLowerRef.current = bbLower;

    const ro = new ResizeObserver(() => {
      if (containerRef.current)
        chart.applyOptions({ width: containerRef.current.clientWidth });
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, [height]);

  // Create RSI chart
  useEffect(() => {
    if (!rsiContainerRef.current) return;

    const chart = createChart(rsiContainerRef.current, {
      width: rsiContainerRef.current.clientWidth,
      height: 120,
      layout: { background: { color: "#161b27" }, textColor: "#94a3b8" },
      grid: {
        vertLines: { color: "#2a3347" },
        horzLines: { color: "#2a3347" },
      },
      rightPriceScale: {
        borderColor: "#2a3347",
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: "#2a3347",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const rsiLine = chart.addLineSeries({
      color: "#f472b6",
      lineWidth: 1,
      priceLineVisible: false,
    });

    rsiChartRef.current = chart;
    rsiSeriesRef.current = rsiLine;

    const ro = new ResizeObserver(() => {
      if (rsiContainerRef.current)
        chart.applyOptions({ width: rsiContainerRef.current.clientWidth });
    });
    ro.observe(rsiContainerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, []);

  // Update candles
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || !candles.length)
      return;

    const candleData: CandlestickData[] = candles.map((c) => ({
      time: (new Date(c.timestamp).getTime() / 1000) as UTCTimestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    const volumeData = candles.map((c) => ({
      time: (new Date(c.timestamp).getTime() / 1000) as UTCTimestamp,
      value: c.volume,
      color: c.close >= c.open ? "#22c55e44" : "#ef444444",
    }));

    candleSeriesRef.current.setData(candleData);
    volumeSeriesRef.current.setData(volumeData);
    chartRef.current?.timeScale().scrollToRealTime();
  }, [candles]);

  // Update SMA
  useEffect(() => {
    if (!smaSeriesRef.current) return;
    const points = indicators?.sma?.filter((p) => p.value !== null) ?? [];
    const data: LineData[] = points.map((p) => ({
      time: (new Date(p.timestamp).getTime() / 1000) as UTCTimestamp,
      value: p.value as number,
    }));
    smaSeriesRef.current.setData(data);
  }, [indicators?.sma]);

  // Update EMA
  useEffect(() => {
    if (!emaSeriesRef.current) return;
    const points = indicators?.ema?.filter((p) => p.value !== null) ?? [];
    const data: LineData[] = points.map((p) => ({
      time: (new Date(p.timestamp).getTime() / 1000) as UTCTimestamp,
      value: p.value as number,
    }));
    emaSeriesRef.current.setData(data);
  }, [indicators?.ema]);

  // Update Bollinger Bands
  useEffect(() => {
    if (!bbUpperRef.current || !bbMiddleRef.current || !bbLowerRef.current)
      return;
    const upper =
      indicators?.bbands?.upper?.filter((p) => p.upper !== null) ?? [];
    const middle =
      indicators?.bbands?.middle?.filter((p) => p.middle !== null) ?? [];
    const lower =
      indicators?.bbands?.lower?.filter((p) => p.lower !== null) ?? [];

    bbUpperRef.current.setData(
      upper.map((p) => ({
        time: (new Date(p.timestamp).getTime() / 1000) as UTCTimestamp,
        value: p.upper as number,
      })),
    );
    bbMiddleRef.current.setData(
      middle.map((p) => ({
        time: (new Date(p.timestamp).getTime() / 1000) as UTCTimestamp,
        value: p.middle as number,
      })),
    );
    bbLowerRef.current.setData(
      lower.map((p) => ({
        time: (new Date(p.timestamp).getTime() / 1000) as UTCTimestamp,
        value: p.lower as number,
      })),
    );
  }, [indicators?.bbands]);

  // Update RSI
  useEffect(() => {
    if (!rsiSeriesRef.current) return;
    const points = rsi?.filter((p) => p.value !== null) ?? [];
    const data: LineData[] = points.map((p) => ({
      time: (new Date(p.timestamp).getTime() / 1000) as UTCTimestamp,
      value: p.value as number,
    }));
    rsiSeriesRef.current.setData(data);
  }, [rsi]);

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
      <div
        ref={containerRef}
        style={{ width: "100%", height: `${height}px` }}
      />
      <div
        ref={rsiContainerRef}
        style={{
          width: "100%",
          height: "120px",
          borderTop: "1px solid #2a3347",
        }}
      />
    </div>
  );
}
