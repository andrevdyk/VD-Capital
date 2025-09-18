import requests
import pandas as pd
from datetime import datetime, timedelta
from supabase import create_client, Client
import os
import json

def get_yahoo_data(symbol, period="5y", interval="1wk"):
    # Calculate timestamps
    end = int(datetime.now().timestamp())
    start = int((datetime.now() - timedelta(days=5*365)).timestamp())
    
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
    params = {
        "period1": start,
        "period2": end,
        "interval": "1wk",
        "events": "history"
    }
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    response = requests.get(url, params=params, headers=headers)
    data = response.json()
    
    if 'chart' in data and 'result' in data['chart'] and data['chart']['result']:
        result = data['chart']['result'][0]
        timestamps = result['timestamp']
        closes = result['indicators']['quote'][0]['close']
        
        # Create DataFrame
        df = pd.DataFrame({
            'date': [datetime.fromtimestamp(ts) for ts in timestamps],
            'close': closes
        })
        return df
    return pd.DataFrame()

def lambda_handler(event, context):
    try:
        # Get Supabase client
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        supabase = create_client(url, key)

        # Commodity mappings
        commodity_mapping = {
            'GC=F': 'Gold',
            'SI=F': 'Silver',
            'PL=F': 'Platinum',
            'HG=F': 'Copper',
            'PA=F': 'Palladium',
            'CL=F': 'Crude Oil',
            'HO=F': 'Heating Oil',
            'NG=F': 'Natural Gas',
            'RB=F': 'Gasoline',
            'BZ=F': 'Brent Crude Oil',
            'ZC=F': 'Corn',
            'ZO=F': 'Oats',
            'KE=F': 'Wheat',
            'ZR=F': 'Rice',
            'ZM=F': 'Soybean Meal',
            'ZL=F': 'Soybean Oil',
            'ZS=F': 'Soybeans',
            'GF=F': 'Feeder Cattle',
            'HE=F': 'Lean Hogs',
            'LE=F': 'Live Cattle',
            'CC=F': 'Cocoa',
            'KC=F': 'Coffee',
            'CT=F': 'Cotton',
            'LBS=F': 'Lumber',
            'OJ=F': 'Orange Juice',
            'SB=F': 'Sugar'
        }

        results = []
        
        # Fetch data for each commodity
        for symbol, name in commodity_mapping.items():
            df = get_yahoo_data(symbol)
            if not df.empty:
                for _, row in df.iterrows():
                    results.append({
                        'date': row['date'],
                        'close': row['close'],
                        'pair': name,
                        'past_prediction': "Past" if row['date'] < datetime.now() else "Prediction"
                    })

        # Create DataFrame and process future dates
        final_data = pd.DataFrame(results)
        future_dates = pd.date_range(start=datetime.today(), periods=12, freq='W-FRI')
        
        future_results = []
        for name in commodity_mapping.values():
            for future_date in future_dates:
                future_results.append({
                    'date': future_date,
                    'close': None,
                    'pair': name,
                    'past_prediction': "Prediction"
                })

        future_data = pd.DataFrame(future_results)
        final_data = pd.concat([final_data, future_data], ignore_index=True)

        # Process data
        final_data['date'] = pd.to_datetime(final_data['date'])
        final_data.sort_values(by=['pair', 'date'], inplace=True)
        
        final_data['close'] = final_data['close'].fillna(method='ffill').fillna(method='bfill')
        final_data['close'] = pd.to_numeric(final_data['close'], errors='coerce')
        
        final_data['percentage_change'] = (
            final_data.groupby('pair')['close']
            .pct_change()
            .fillna(0) * 100
        )

        final_data['week'] = final_data['date'].dt.isocalendar().week

        # Calculate seasonality
        historical_data = final_data[final_data['past_prediction'] == "Past"]
        
        seasonality_avg = (
            historical_data.groupby(['pair', 'week'])['percentage_change']
            .mean()
            .reset_index()
            .rename(columns={'percentage_change': 'seasonality_avg'})
        )

        probability = (
            historical_data.groupby(['pair', 'week'])
            .apply(lambda x: (x['percentage_change'] > 0).mean() * 100)
            .reset_index()
            .rename(columns={0: 'probability'})
        )

        # Merge and update predictions
        final_data = final_data.merge(seasonality_avg, on=['pair', 'week'], how='left')
        final_data = final_data.merge(probability, on=['pair', 'week'], how='left')
        
        final_data.loc[final_data['past_prediction'] == "Prediction", 'percentage_change'] = final_data['seasonality_avg']

        # Calculate predicted closes
        last_known_close = historical_data.groupby('pair')['close'].last().to_dict()
        for index, row in final_data.iterrows():
            if row['past_prediction'] == "Prediction":
                pair = row['pair']
                if index == 0 or final_data.at[index - 1, 'pair'] != pair:
                    last_close = last_known_close.get(pair, 0)
                else:
                    last_close = final_data.at[index - 1, 'close']
                predicted_change = row['percentage_change'] / 100
                predicted_close = last_close * (1 + predicted_change)
                final_data.at[index, 'close'] = predicted_close

        # Clean up and format
        final_data.drop(columns=['seasonality_avg'], inplace=True)
        final_data['percentage_change'] = final_data['percentage_change'].round(2)
        final_data['probability'] = final_data['probability'].round(2)
        final_data['close'] = final_data['close'].round(5)
        final_data['date'] = final_data['date'].dt.strftime('%Y-%m-%d')

        # Handle NaN values
        final_data.fillna({
            'close': 0,
            'percentage_change': 0,
            'probability': 0
        }, inplace=True)

        # Update Supabase
        response = supabase.table('seasonality_commodities').upsert(
            final_data.to_dict(orient='records')
        ).execute()
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'success': True,
                'message': 'Data updated successfully',
                'rows_affected': len(final_data)
            })
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({
                'success': False,
                'error': str(e)
            })
        }