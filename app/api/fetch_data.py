# File: pages/api/fetch_data.py

import json
import os
import requests
import psycopg2
from psycopg2.extras import execute_values

def handler(request, response):
    try:
        # Step 1: Fetch the JSON Data from the CFTC API
        api_url = "https://publicreporting.cftc.gov/resource/yw9f-hn96.json?$query=SELECT%0A%20%20%60id%60%2C%0A%20%20%60report_date_as_yyyy_mm_dd%60%2C%0A%20%20%60contract_market_name%60%2C%0A%20%20%60commodity_name%60%2C%0A%20%20%60open_interest_all%60%2C%0A%20%20%60dealer_positions_long_all%60%2C%0A%20%20%60dealer_positions_short_all%60%2C%0A%20%20%60dealer_positions_spread_all%60%2C%0A%20%20%60asset_mgr_positions_long%60%2C%0A%20%20%60asset_mgr_positions_short%60%2C%0A%20%20%60asset_mgr_positions_spread%60%2C%0A%20%20%60lev_money_positions_long%60%2C%0A%20%20%60lev_money_positions_short%60%2C%0A%20%20%60lev_money_positions_spread%60%2C%0A%20%20%60other_rept_positions_long%60%2C%0A%20%20%60other_rept_positions_short%60%2C%0A%20%20%60other_rept_positions_spread%60%2C%0A%20%20%60nonrept_positions_long_all%60%2C%0A%20%20%60nonrept_positions_short_all%60%2C%0A%20%20%60change_in_open_interest_all%60%2C%0A%20%20%60change_in_dealer_long_all%60%2C%0A%20%20%60change_in_dealer_short_all%60%2C%0A%20%20%60change_in_dealer_spread_all%60%2C%0A%20%20%60change_in_asset_mgr_long%60%2C%0A%20%20%60change_in_asset_mgr_short%60%2C%0A%20%20%60change_in_asset_mgr_spread%60%2C%0A%20%20%60change_in_lev_money_long%60%2C%0A%20%20%60change_in_lev_money_short%60%2C%0A%20%20%60change_in_lev_money_spread%60%2C%0A%20%20%60change_in_other_rept_long%60%2C%0A%20%20%60change_in_other_rept_short%60%2C%0A%20%20%60change_in_other_rept_spread%60%2C%0A%20%20%60change_in_nonrept_long_all%60%2C%0A%20%20%60change_in_nonrept_short_all%60%2C%0A%20%20%60commodity_subgroup_name%60%0AORDER%20BY%20%60report_date_as_yyyy_mm_dd%60%20DESC%20NULL%20LAST"

        response_api = requests.get(api_url)
        if response_api.status_code != 200:
            raise Exception(f"Failed to fetch data: {response_api.status_code}")

        json_data = response_api.json()

        # Step 2: Connect to Supabase PostgreSQL
        conn = psycopg2.connect(
            host=os.environ['SUPABASE_HOST'],
            dbname=os.environ['SUPABASE_DB_NAME'],
            user=os.environ['SUPABASE_USER'],
            password=os.environ['SUPABASE_PASSWORD'],
            port=5432  # Default PostgreSQL port
        )
        cur = conn.cursor()

        # Step 3: Insert Data into the Structured Table
        insert_query = '''
        INSERT INTO cftc_report_data (
            id,
            report_date,
            contract_market_name,
            commodity_name,
            open_interest_all,
            dealer_positions_long_all,
            dealer_positions_short_all,
            dealer_positions_spread_all,
            asset_mgr_positions_long,
            asset_mgr_positions_short,
            asset_mgr_positions_spread,
            lev_money_positions_long,
            lev_money_positions_short,
            lev_money_positions_spread,
            other_rept_positions_long,
            other_rept_positions_short,
            other_rept_positions_spread,
            nonrept_positions_long_all,
            nonrept_positions_short_all,
            change_in_open_interest_all,
            change_in_dealer_long_all,
            change_in_dealer_short_all,
            change_in_dealer_spread_all,
            change_in_asset_mgr_long,
            change_in_asset_mgr_short,
            change_in_asset_mgr_spread,
            change_in_lev_money_long,
            change_in_lev_money_short,
            change_in_lev_money_spread,
            change_in_other_rept_long,
            change_in_other_rept_short,
            change_in_other_rept_spread,
            change_in_nonrept_long_all,
            change_in_nonrept_short_all,
            commodity_subgroup_name
        ) VALUES %s
        ON CONFLICT (id) DO NOTHING;
        '''

        # Prepare data for bulk insertion
        values = [
            (
                record.get('id'),
                record.get('report_date_as_yyyy_mm_dd'),
                record.get('contract_market_name'),
                record.get('commodity_name'),
                record.get('open_interest_all'),
                record.get('dealer_positions_long_all'),
                record.get('dealer_positions_short_all'),
                record.get('dealer_positions_spread_all'),
                record.get('asset_mgr_positions_long'),
                record.get('asset_mgr_positions_short'),
                record.get('asset_mgr_positions_spread'),
                record.get('lev_money_positions_long'),
                record.get('lev_money_positions_short'),
                record.get('lev_money_positions_spread'),
                record.get('other_rept_positions_long'),
                record.get('other_rept_positions_short'),
                record.get('other_rept_positions_spread'),
                record.get('nonrept_positions_long_all'),
                record.get('nonrept_positions_short_all'),
                record.get('change_in_open_interest_all'),
                record.get('change_in_dealer_long_all'),
                record.get('change_in_dealer_short_all'),
                record.get('change_in_dealer_spread_all'),
                record.get('change_in_asset_mgr_long'),
                record.get('change_in_asset_mgr_short'),
                record.get('change_in_asset_mgr_spread'),
                record.get('change_in_lev_money_long'),
                record.get('change_in_lev_money_short'),
                record.get('change_in_lev_money_spread'),
                record.get('change_in_other_rept_long'),
                record.get('change_in_other_rept_short'),
                record.get('change_in_other_rept_spread'),
                record.get('change_in_nonrept_long_all'),
                record.get('change_in_nonrept_short_all'),
                record.get('commodity_subgroup_name')
            )
            for record in json_data
        ]

        # Use execute_values for efficient bulk insertion
        execute_values(cur, insert_query, values)

        # Commit the transaction
        conn.commit()

        # Close the connection
        cur.close()
        conn.close()

        # Step 4: Return a Successful Response
        response.status_code = 200
        response.json({'message': 'Data fetched and inserted successfully'})

    except Exception as e:
        # Handle any errors
        response.status_code = 500
        response.json({'error': str(e)})
