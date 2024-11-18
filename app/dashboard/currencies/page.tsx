import React from "react";
import { CurrencyStrength } from "./components/currencystrength";
import { SelectCurrency } from "../components/asset-selector";
import { Seasonality } from "./components/seasonality_currencies";
import { CFTCChart } from "./components/cftc-area-chart";
import { CurrencySelector } from "./components/currency-selector";
import { DealerDonut } from "./components/dealer-donut";
import { AssetDonut } from "./components/asset-donut";
import { LeveragedDonut } from "./components/leveraged-donut";

export default function CurrenciesPage() {
  return (
    <div className="flex ">
      {/* Centered Currency Selector */}
      <div className="absolute top-[5px] left-1/2 transform -translate-x-1/2 z-10">
        <CurrencySelector />
      </div>

      <div className="w-fit flex flex-col gap-2 ml-2 pt-2 ">
        <CurrencyStrength />
        <Seasonality />
      </div>

      {/* Centered Donut Charts */}
      <div className="flex flex-col justify-center items-center gap-2 pt-2 mx-auto ">
        <DealerDonut />
        <AssetDonut />
        <LeveragedDonut />
      </div>

      <div className="w-fit flex flex-col gap-2 ml-auto mr-2 pt-2 ">
        <CurrencyStrength />
        <Seasonality />
      </div>
    </div>
  );
}
