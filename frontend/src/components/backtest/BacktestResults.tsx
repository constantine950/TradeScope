"use client";
import MetricsCards from "./MetricsCards";
import EquityCurveChart from "./EquityCurveChart";
import TradeLogTable from "./TradeLogTable";
import { BacktestResult, BacktestTrade } from "../../types/backtest";
import { EquityPoint } from "../../types/backtest";

interface Props {
  result: BacktestResult;
  trades: BacktestTrade[];
  equityCurve: EquityPoint[];
  initialCapital: number;
}

export default function BacktestResults({
  result,
  trades,
  equityCurve,
  initialCapital,
}: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <MetricsCards result={result} initialCapital={initialCapital} />
      <EquityCurveChart
        equityCurve={equityCurve}
        trades={trades}
        initialCapital={initialCapital}
      />
      <TradeLogTable trades={trades} />
    </div>
  );
}
