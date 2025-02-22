import yfinance as yf
import pandas as pd
from datetime import datetime
from supabase import create_client, Client
import os

# Initialize Supabase client
supabase: Client = create_client(
    "https://nobtgazxiggvkrwxugpq.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vYnRnYXp4aWdndmtyd3h1Z3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY2Nzk5OTIsImV4cCI6MjA0MjI1NTk5Mn0.SWmzkATJ5uUNhCrFdXB-FeCEL3wcVk6p_eDqXpOD-qg"
)

# Currency mappings
currency_mapping = {
    'AUDUSD=X': 'AUDUSD',
    'CNY=X': 'USDCNY',
    'EURCAD=X': 'EURCAD',
    'EURCHF=X': 'EURCHF',
    'EURGBP=X': 'EURGBP',
    'EURHUF=X': 'EURHUF',
    'EURJPY=X': 'EURJPY',
    'EURSEK=X': 'EURSEK',
    'EURUSD=X': 'EURUSD',
    'GBPJPY=X': 'GBPJPY',
    'GBPUSD=X': 'GBPUSD',
    'HKD=X': 'USDHKD',
    'IDR=X': 'USDIDR',
    'INR=X': 'USDINR',
    'JPY=X': 'USDJPY',
    'MXN=X': 'USDMXN',
    'MYR=X': 'USDMYR',
    'NZDUSD=X': 'NZDUSD',
    'PHP=X': 'USDPHP',
    'RUB=X': 'USDRUB',
    'SGD=X': 'USDSGD',
    'THB=X': 'USDTHB',
    'ZAR=X': 'USDZAR'
}

currency_pairs = list(currency_mapping.keys())

def update_currency_data():
    try:
        print("Downloading currency data...")
        # Download data
        data = yf.download(
            currency_pairs,
            period="5y",
            interval="1wk",
            auto_adjust=False,
            group_by="ticker"
        )

        print("Processing downloaded data...")
        # Handle MultiIndex columns
        if isinstance(data.columns, pd.MultiIndex):
            # For multiple pairs, we need to process each pair separately
            results = []
            for pair in currency_pairs:
                if pair in data.columns.levels[0]:
                    pair_data = data[pair]['Close']  # Get Close prices for this pair
                    for date, close in zip(pair_data.index, pair_data.values):
                        results.append({
                            'date': date,
                            'close': close,
                            'pair': currency_mapping[pair],
                            'past_prediction': "Past" if date < datetime.now() else "Prediction"
                        })
        else:
            # Single pair case
            if 'Close' not in data.columns:
                raise ValueError("Close column missing in dataset")
            
            results = []
            for pair in currency_pairs:
                for date, close in zip(data.index, data['Close']):
                    results.append({
                        'date': date,
                        'close': close,
                        'pair': currency_mapping[pair],
                        'past_prediction': "Past" if date < datetime.now() else "Prediction"
                    })

        print("Creating DataFrame...")
        # Create DataFrame and add future dates
        final_data = pd.DataFrame(results)
        future_dates = pd.date_range(start=datetime.today(), periods=12, freq='W-FRI')
        
        future_results = []
        for pair in currency_pairs:
            for future_date in future_dates:
                future_results.append({
                    'date': future_date,
                    'close': None,
                    'pair': currency_mapping[pair],
                    'past_prediction': "Prediction"
                })

        future_data = pd.DataFrame(future_results)
        final_data = pd.concat([final_data, future_data], ignore_index=True)

        print("Processing data...")
        # Process data
        final_data['date'] = pd.to_datetime(final_data['date'])
        final_data.sort_values(by=['pair', 'date'], inplace=True)
        
        # Handle missing values and calculate changes
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

        print("Calculating predictions...")
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

        print("Updating Supabase...")
        # Update Supabase
        try:
            response = supabase.table('seasonality_currencies').upsert(
                final_data.to_dict(orient='records')
            ).execute()
            print("Data updated successfully!")
            print(f"Rows affected: {len(final_data)}")
            print(f"Timestamp: {datetime.now().isoformat()}")

        except Exception as e:
            print(f"Database error: {str(e)}")

    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == '__main__':
    print("Starting currency data update...")
    update_currency_data()