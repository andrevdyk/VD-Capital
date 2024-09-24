import yfinance as yf
import pandas as pd
from datetime import datetime
from supabase import create_client, Client
import schedule
import time

# Supabase credentials
url = "https://nobtgazxiggvkrwxugpq.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vYnRnYXp4aWdndmtyd3h1Z3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY2Nzk5OTIsImV4cCI6MjA0MjI1NTk5Mn0.SWmzkATJ5uUNhCrFdXB-FeCEL3wcVk6p_eDqXpOD-qg"  # Replace with your actual Supabase key
supabase: Client = create_client(url, key)

# Mapping of Yahoo Finance commodites to general language format
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

commodities = [
    'GC=F', 'SI=F', 'PL=F', 'HG=F', 'PA=F', 'CL=F', 'HO=F', 'NG=F', 
    'RB=F', 'BZ=F', 'ZC=F', 'ZO=F', 'KE=F', 'ZR=F', 'ZM=F', 'ZL=F', 'ZS=F', 
    'GF=F', 'HE=F', 'LE=F', 'CC=F', 'KC=F', 'CT=F', 'LBS=F', 'OJ=F', 'SB=F'
]


def fetch_and_insert_data():
    # Initialize an empty list to store results
    results = []

    # Fetch data for each commodites
    for commodity in commodities:
        data = yf.download(commodity, period="5y", interval="1wk")

        # Create a DataFrame with the desired columns
        for date, close in zip(data.index, data['Close']):
            results.append({'date': date, 'close': close, 'commodity': commodity_mapping[commodity], 
                            'past_prediction': "Past" if date < datetime.now() else "Prediction"})

    # Create a final DataFrame from historical data
    final_data = pd.DataFrame(results)

    # Generate the next 12 weeks' dates
    future_dates = pd.date_range(start=datetime.today(), periods=12, freq='W-FRI')

    # Prepare a list to store future data
    future_results = []

    # Add future dates to the DataFrame for each commodities
    for commodity in commodities:
        for future_date in future_dates:
            future_results.append({
                'date': future_date,
                'close': None,  # No closing price available for future dates
                'commodity': commodity_mapping[commodity],
                'past_prediction': "Prediction"  # Future dates are predictions
            })

    # Create a DataFrame for future results and concatenate it with the historical data
    future_data = pd.DataFrame(future_results)
    final_data = pd.concat([final_data, future_data], ignore_index=True)

    # Reset index for better readability
    final_data.reset_index(drop=True, inplace=True)

    # Convert 'date' column to datetime type and sort the DataFrame by date
    final_data['date'] = pd.to_datetime(final_data['date'])
    final_data.sort_values(by=['commodity', 'date'], inplace=True)

    # Calculate percentage change from the last week
    final_data['percentage_change'] = final_data.groupby('commodity')['close'].pct_change() * 100

    # Add week number column (1-52)
    final_data['week'] = final_data['date'].dt.isocalendar().week

    # Calculate seasonality averages for the last 4 years
    historical_data = final_data[final_data['past_prediction'] == "Past"]

    # Calculate average percentage change by week and commodity
    seasonality_avg = historical_data.groupby(['commodity', 'week'])['percentage_change'].mean().reset_index()
    seasonality_avg.rename(columns={'percentage_change': 'seasonality_avg'}, inplace=True)

    # Calculate the probability of a positive percentage change
    probability = historical_data.groupby(['commodity', 'week']).apply(lambda x: (x['percentage_change'] > 0).mean() * 100).reset_index()
    probability.rename(columns={0: 'probability'}, inplace=True)

    # Merge the seasonality averages and probability back into the main DataFrame
    final_data = final_data.merge(seasonality_avg, on=['commodity', 'week'], how='left')
    final_data = final_data.merge(probability, on=['commodity', 'week'], how='left')

    # Update percentage_change for predictions with the seasonality average
    final_data.loc[final_data['past_prediction'] == "Prediction", 'percentage_change'] = final_data['seasonality_avg']

    # Fill in the 'close' price for predictions based on last known close and percentage change
    last_known_close = historical_data.groupby('commodity')['close'].last().to_dict()

    for index, row in final_data.iterrows():
        if row['past_prediction'] == "Prediction":
            commodity = row['commodity']
            if index == 0 or final_data.at[index - 1, 'commodity'] != commodity:
                last_close = last_known_close[commodity]
            else:
                last_close = final_data.at[index - 1, 'close']

            predicted_change = row['percentage_change'] / 100
            predicted_close = last_close * (1 + predicted_change)
            final_data.at[index, 'close'] = predicted_close

    final_data.drop(columns=['seasonality_avg'], inplace=True)

    # Round the percentage_change and probability to 2 decimal points
    final_data['percentage_change'] = final_data['percentage_change'].round(2)
    final_data['probability'] = final_data['probability'].round(2)

    # Round the close price to 5 decimal points
    final_data['close'] = final_data['close'].round(5)

    # Convert 'date' column to string format for JSON serialization
    final_data['date'] = final_data['date'].dt.strftime('%Y-%m-%d')  # Convert to string in YYYY-MM-DD format

    # Fill NaN values with appropriate defaults (0 or empty strings)
    final_data.fillna({
        'close': 0,  # or use None if you want to indicate missing values
        'percentage_change': 0,
        'probability': 0
    }, inplace=True)

    # Print the resulting DataFrame for debugging
    print(final_data)

    # Insert new data into Supabase
    try:
      response = supabase.table('seasonality_commodities').delete().execute()  # Delete all old data
      print("Data deleted successfully:", response)
    except Exception as exception:
        print("Error deleting data:", exception)
    # Insert new data with error handling
    try:
        response = supabase.table('seasonality_commodities').insert(final_data.to_dict(orient='records')).execute()
        print("Data inserted successfully:", response)
    except Exception as exception:
        print("Error inserting data:", exception)

# Run the function immediately to fetch data and insert it into Supabase
#fetch_and_insert_data()

# Uncomment the following lines to schedule the task every Saturday at 12:05 AM
schedule.every().saturday.at("00:06").do(fetch_and_insert_data)

# Keep the script running if scheduling is active
while True:
    schedule.run_pending()
    time.sleep(1)
