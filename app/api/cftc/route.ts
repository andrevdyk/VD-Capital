import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request : Request) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    )

    const {data} = await supabase .from('cftc_data_combined')
    .select('report_date, open_interest_all, dealer_positions_long_all, dealer_positions_short_all, asset_mgr_positions_long, asset_mgr_positions_short, lev_money_positions_long, lev_money_positions_short, commodity_subgroup_name, contract_market_name');
    return NextResponse.json(data);

}