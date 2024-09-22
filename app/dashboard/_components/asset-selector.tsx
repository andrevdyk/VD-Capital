import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/utils/supabase/server";

export default async function SelectCurrency() {
  const supabase = createClient();
  const { data: assets, error } = await supabase
    .from("cftc_assets")
    .select("symbol")
    .eq('commodity_subgroup_name', 'CURRENCY'); // Filter out rows where commodity_subgroup_name is "CURRENCY"

  if (error) {
    return <p>Error fetching data: {error.message}</p>;
  }

  return (
    <Select>
      <SelectTrigger className="w-[100px] ">
        <SelectValue placeholder="Asset Selection" className="mr-auto ml-2"/>
      </SelectTrigger>
      <SelectContent>
        {assets && assets.length > 0 ? (
          assets.map((asset, index) => (
            <SelectItem key={index} value={asset.symbol}>
              {asset.symbol}
            </SelectItem>
          ))
        ) : (
          <SelectItem disabled>No assets available</SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
