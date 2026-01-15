"use client";

import { useState, useMemo } from "react";
import { Fuel, TrendingDown, Calculator, Info } from "lucide-react";

// EU Label fuel efficiency ratings
type EuLabelRating = "A" | "B" | "C" | "D" | "E" | "F" | "G";

// Fuel consumption difference per 100km between ratings
// Based on EU tire labeling regulations
const FUEL_DIFFERENCE_L_PER_100KM: Record<string, number> = {
  "A-B": 0.1,
  "A-C": 0.25,
  "A-D": 0.4,
  "A-E": 0.55,
  "A-F": 0.7,
  "A-G": 0.85,
  "B-C": 0.15,
  "B-D": 0.3,
  "B-E": 0.45,
  "B-F": 0.6,
  "B-G": 0.75,
  "C-D": 0.15,
  "C-E": 0.3,
  "C-F": 0.45,
  "C-G": 0.6,
  "D-E": 0.15,
  "D-F": 0.3,
  "D-G": 0.45,
  "E-F": 0.15,
  "E-G": 0.3,
  "F-G": 0.15,
};

// Average fuel price in Ukraine (UAH per liter)
const DEFAULT_FUEL_PRICE = 55;

// Annual mileage presets
const MILEAGE_PRESETS = [
  { label: "5,000 км", value: 5000 },
  { label: "10,000 км", value: 10000 },
  { label: "15,000 км", value: 15000 },
  { label: "20,000 км", value: 20000 },
  { label: "30,000 км", value: 30000 },
];

interface FuelCalculatorProps {
  currentRating?: EuLabelRating;
  className?: string;
}

function getFuelDifference(from: EuLabelRating, to: EuLabelRating): number {
  // Normalize the key (always use worse → better order)
  const ratings: EuLabelRating[] = ["A", "B", "C", "D", "E", "F", "G"];
  const fromIndex = ratings.indexOf(from);
  const toIndex = ratings.indexOf(to);

  if (fromIndex === toIndex) return 0;

  const betterRating = fromIndex < toIndex ? from : to;
  const worseRating = fromIndex < toIndex ? to : from;
  const key = `${betterRating}-${worseRating}`;

  return FUEL_DIFFERENCE_L_PER_100KM[key] || 0;
}

export function FuelCalculator({ currentRating = "C", className = "" }: FuelCalculatorProps) {
  const [annualKm, setAnnualKm] = useState(15000);
  const [compareRating, setCompareRating] = useState<EuLabelRating>(
    currentRating === "A" ? "C" : "A"
  );
  const [fuelPrice, setFuelPrice] = useState(DEFAULT_FUEL_PRICE);

  const ratings: EuLabelRating[] = ["A", "B", "C", "D", "E", "F", "G"];
  const worseRatings = ratings.filter((r) => r > currentRating);

  const savings = useMemo(() => {
    const diff = getFuelDifference(currentRating, compareRating);
    if (diff === 0) return null;

    // Current tire is better
    const isBetter = ratings.indexOf(currentRating) < ratings.indexOf(compareRating);

    const litersPerYear = (annualKm / 100) * diff;
    const moneyPerYear = litersPerYear * fuelPrice;

    return {
      isBetter,
      liters: Math.round(litersPerYear * 10) / 10,
      money: Math.round(moneyPerYear),
      difference: diff,
    };
  }, [currentRating, compareRating, annualKm, fuelPrice]);

  return (
    <div className={`bg-card border border-border rounded-xl p-5 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
          <Calculator className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="font-semibold">Калькулятор економії палива</h3>
      </div>

      {/* Annual mileage slider */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Річний пробіг
        </label>
        <input
          type="range"
          min="5000"
          max="50000"
          step="1000"
          value={annualKm}
          onChange={(e) => setAnnualKm(parseInt(e.target.value))}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>5,000 км</span>
          <span className="font-medium text-foreground">
            {annualKm.toLocaleString("uk-UA")} км
          </span>
          <span>50,000 км</span>
        </div>
      </div>

      {/* Comparison selection */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Порівняти з класом
        </label>
        <div className="flex gap-2 flex-wrap">
          {worseRatings.map((rating) => (
            <button
              key={rating}
              onClick={() => setCompareRating(rating)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                compareRating === rating
                  ? "bg-primary text-primary-text"
                  : "bg-stone-200 text-stone-700 hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600"
              }`}
            >
              Клас {rating}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Ваша шина: Клас {currentRating}
        </p>
      </div>

      {/* Results */}
      {savings && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="font-medium text-green-700 dark:text-green-300">
              {savings.isBetter ? "Ви економите" : "Ви втрачаєте"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Fuel className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Паливо</span>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {savings.liters} л
              </p>
              <p className="text-xs text-muted-foreground">на рік</p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm text-muted-foreground">Гроші</span>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {savings.money.toLocaleString("uk-UA")} ₴
              </p>
              <p className="text-xs text-muted-foreground">на рік</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-3 flex items-start gap-1">
            <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <span>
              Розрахунок базується на різниці споживання{" "}
              {savings.difference} л/100км між класами {currentRating} та{" "}
              {compareRating} при ціні {fuelPrice} ₴/л
            </span>
          </p>
        </div>
      )}

      {!savings && (
        <div className="rounded-lg bg-stone-200 p-4 text-center text-stone-700 dark:bg-stone-700 dark:text-stone-200">
          <p className="text-sm">
            Оберіть клас для порівняння, щоб побачити економію
          </p>
        </div>
      )}

      {/* Fuel price adjustment */}
      <details className="mt-4">
        <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
          Змінити ціну палива
        </summary>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="number"
            value={fuelPrice}
            onChange={(e) => setFuelPrice(parseInt(e.target.value) || DEFAULT_FUEL_PRICE)}
            className="w-20 px-2 py-1 border border-border rounded text-sm"
            min="30"
            max="100"
          />
          <span className="text-sm text-muted-foreground">₴/літр</span>
        </div>
      </details>
    </div>
  );
}

// Compact version for sidebar
export function FuelCalculatorCompact({
  currentRating = "C",
  annualKm = 15000,
}: {
  currentRating?: EuLabelRating;
  annualKm?: number;
}) {
  const compareRating = currentRating === "A" ? "C" : "A";
  const diff = getFuelDifference(currentRating, compareRating);

  if (diff === 0) return null;

  const litersPerYear = Math.round((annualKm / 100) * diff * 10) / 10;
  const moneyPerYear = Math.round(litersPerYear * DEFAULT_FUEL_PRICE);

  return (
    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-sm">
      <div className="flex items-center gap-2 mb-2">
        <Fuel className="h-4 w-4 text-green-600 dark:text-green-400" />
        <span className="font-medium text-green-700 dark:text-green-300">
          Економія палива
        </span>
      </div>
      <p className="text-green-600 dark:text-green-400">
        <span className="font-bold">{litersPerYear} л</span> та{" "}
        <span className="font-bold">{moneyPerYear.toLocaleString("uk-UA")} ₴</span> на рік
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        порівняно з класом {compareRating}
      </p>
    </div>
  );
}

export default FuelCalculator;
