"""
CFTC Data to Supabase Pipeline
Fetches CFTC data and upserts it into Supabase
"""

import pandas as pd
from sodapy import Socrata
from supabase import create_client, Client
import os
from datetime import datetime

# Configuration
CFTC_DOMAIN = "publicreporting.cftc.gov"
CFTC_APP_TOKEN = "GjNIwiGLWTBol1Tavikx3GlVm"
CFTC_DATASET_ID = "yw9f-hn96"

## Supabase credentials (set these as environment variables)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

def fetch_cftc_data(limit=50000, offset=0, start_date="2024-10-01"):
    """Fetch data from CFTC API filtered by date"""
    print(f"Fetching records from CFTC API (offset: {offset}, date >= {start_date})...")
    
    client = Socrata(CFTC_DOMAIN, CFTC_APP_TOKEN)
    
    # Add date filter using SoQL query
    where_clause = f"report_date_as_yyyy_mm_dd >= '{start_date}T00:00:00.000'"
    results = client.get(CFTC_DATASET_ID, limit=limit, offset=offset, where=where_clause)
    
    df = pd.DataFrame.from_records(results)
    print(f"Fetched {len(df)} records")
    
    return df

def transform_data(df):
    """Transform CFTC data to match Supabase schema"""
    print("Transforming data...")
    
    # Create a mapping of CFTC fields to Supabase fields
    field_mapping = {
        'id': 'id',
        'report_date_as_yyyy_mm_dd': 'report_date',
        'contract_market_name': 'contract_market_name',
        'commodity_name': 'commodity_name',
        'open_interest_all': 'open_interest_all',
        'dealer_positions_long_all': 'dealer_positions_long_all',
        'dealer_positions_short_all': 'dealer_positions_short_all',
        'dealer_positions_spread_all': 'dealer_positions_spread_all',
        'asset_mgr_positions_long': 'asset_mgr_positions_long',
        'asset_mgr_positions_short': 'asset_mgr_positions_short',
        'asset_mgr_positions_spread': 'asset_mgr_positions_spread',
        'lev_money_positions_long': 'lev_money_positions_long',
        'lev_money_positions_short': 'lev_money_positions_short',
        'lev_money_positions_spread': 'lev_money_positions_spread',
        'other_rept_positions_long': 'other_rept_positions_long',
        'other_rept_positions_short': 'other_rept_positions_short',
        'other_rept_positions_spread': 'other_rept_positions_spread',
        'nonrept_positions_long_all': 'nonrept_positions_long_all',
        'nonrept_positions_short_all': 'nonrept_positions_short_all',
        'change_in_open_interest_all': 'change_in_open_interest_all',
        'change_in_dealer_long_all': 'change_in_dealer_long_all',
        'change_in_dealer_short_all': 'change_in_dealer_short_all',
        'change_in_dealer_spread_all': 'change_in_dealer_spread_all',
        'change_in_asset_mgr_long': 'change_in_asset_mgr_long',
        'change_in_asset_mgr_short': 'change_in_asset_mgr_short',
        'change_in_asset_mgr_spread': 'change_in_asset_mgr_spread',
        'change_in_lev_money_long': 'change_in_lev_money_long',
        'change_in_lev_money_short': 'change_in_lev_money_short',
        'change_in_lev_money_spread': 'change_in_lev_money_spread',
        'change_in_other_rept_long': 'change_in_other_rept_long',
        'change_in_other_rept_short': 'change_in_other_rept_short',
        'change_in_other_rept_spread': 'change_in_other_rept_spread',
        'change_in_nonrept_long_all': 'change_in_nonrept_long_all',
        'change_in_nonrept_short_all': 'change_in_nonrept_short_all',
        'commodity_subgroup_name': 'commodity_subgroup_name'
    }
    
    # Select and rename columns
    available_cols = [col for col in field_mapping.keys() if col in df.columns]
    transformed_df = df[available_cols].copy()
    transformed_df.columns = [field_mapping[col] for col in available_cols]
    
    # Convert date field
    if 'report_date' in transformed_df.columns:
        transformed_df['report_date'] = pd.to_datetime(
            transformed_df['report_date'], 
            errors='coerce'
        ).dt.date
    
    # Convert numeric fields to integers
    numeric_fields = [col for col in transformed_df.columns 
                     if col not in ['id', 'report_date', 'contract_market_name', 
                                   'commodity_name', 'commodity_subgroup_name']]
    
    for field in numeric_fields:
        if field in transformed_df.columns:
            transformed_df[field] = pd.to_numeric(
                transformed_df[field], 
                errors='coerce'
            ).fillna(0).astype('Int64')
    
    # Remove rows with null IDs
    transformed_df = transformed_df.dropna(subset=['id'])
    
    print(f"Transformed {len(transformed_df)} records")
    return transformed_df

def upsert_to_supabase(df, batch_size=1000):
    """Upsert data to Supabase in batches"""
    print("Connecting to Supabase...")
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Convert DataFrame to list of dictionaries
    records = df.to_dict('records')
    
    # Convert date objects to strings and Int64 to regular ints
    for record in records:
        if 'report_date' in record and record['report_date'] is not None:
            record['report_date'] = str(record['report_date'])
        # Convert pandas Int64 to regular int or None
        for key, value in record.items():
            if pd.isna(value):
                record[key] = None
            elif isinstance(value, (pd.Int64Dtype, int)):
                record[key] = int(value) if not pd.isna(value) else None
    
    total_records = len(records)
    print(f"Upserting {total_records} records in batches of {batch_size}...")
    
    success_count = 0
    error_count = 0
    
    for i in range(0, total_records, batch_size):
        batch = records[i:i + batch_size]
        try:
            response = supabase.table('cftc_data_combined').upsert(batch).execute()
            success_count += len(batch)
            print(f"Progress: {success_count}/{total_records} records upserted")
        except Exception as e:
            error_count += len(batch)
            print(f"Error upserting batch {i//batch_size + 1}: {str(e)}")
    
    print(f"\nCompleted: {success_count} successful, {error_count} errors")
    return success_count, error_count

def main():
    """Main execution function"""
    print("="*60)
    print("CFTC to Supabase Data Pipeline")
    print("="*60)
    
    try:
        # Fetch data
        df = fetch_cftc_data(limit=5000)  # Adjust limit as needed
        
        if df.empty:
            print("No data fetched. Exiting.")
            return
        
        # Transform data
        transformed_df = transform_data(df)
        
        if transformed_df.empty:
            print("No data to upsert after transformation. Exiting.")
            return
        
        # Upsert to Supabase
        success, errors = upsert_to_supabase(transformed_df, batch_size=500)
        
        print("\n" + "="*60)
        print("Pipeline completed successfully!")
        print(f"Total records processed: {len(transformed_df)}")
        print(f"Successfully upserted: {success}")
        print(f"Errors: {errors}")
        print("="*60)
        
    except Exception as e:
        print(f"\nError in pipeline: {str(e)}")
        raise

if __name__ == "__main__":
    main()