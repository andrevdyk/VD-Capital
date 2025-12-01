import requests
from bs4 import BeautifulSoup
import pandas as pd
from supabase import create_client, Client
import os
import numpy as np

SUPABASE_URL = 'https://nobtgazxiggvkrwxugpq.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vYnRnYXp4aWdndmtyd3h1Z3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY2Nzk5OTIsImV4cCI6MjA0MjI1NTk5Mn0.SWmzkATJ5uUNhCrFdXB-FeCEL3wcVk6p_eDqXpOD-qg'

def fetch_matrix_table():
    url = "https://tradingeconomics.com/matrix"

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/123.0.0.0 Safari/537.36"
        )
    }

    response = requests.get(url, headers=headers)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    table = soup.find("table")

    rows = []
    for tr in table.find_all("tr"):
        cols = [td.get_text(strip=True) for td in tr.find_all(["td", "th"])]
        rows.append(cols)

    df = pd.DataFrame(rows[1:], columns=rows[0])
    return df


def clean_dataframe(df):
    numeric_cols = df.columns[1:]

    for col in numeric_cols:
        df[col] = (
            df[col]
            .str.replace(",", "")
            .str.replace("%", "")
            .replace("-", None)
        )
        df[col] = pd.to_numeric(df[col], errors="coerce")

    return df


def map_columns_to_db(df):
    """Map DataFrame columns to match database schema"""
    column_mapping = {
        'Country': 'country',
        'GDP': 'gdp',
        'GDP Growth': 'gdp_growth',
        'Interest Rate': 'interest_rate',
        'Inflation Rate': 'inflation_rate',
        'Jobless Rate': 'jobless_rate',
        'Gov. Budget': 'gov_budget',
        'Debt/GDP': 'debt_gdp',
        'Current Account': 'current_account',
        'Population': 'population'
    }
    
    df = df.rename(columns=column_mapping)
    return df


def upsert_into_supabase(df):
    supabase: Client = create_client(
        SUPABASE_URL,
        SUPABASE_KEY
    )

    # Map columns to database schema
    df = map_columns_to_db(df)
    
    # Replace all NaN and inf values with None
    df = df.replace([np.nan, np.inf, -np.inf], None)
    
    data = df.to_dict(orient="records")

    res = supabase.table("economics_matrix").upsert(
        data,
        on_conflict="country"
    ).execute()

    print(f"Upserted {len(data)} rows")
    return res


if __name__ == "__main__":
    print("Fetching TradingEconomics Matrix data...")
    df = fetch_matrix_table()
    df = clean_dataframe(df)
    print(df.head())
    upsert_into_supabase(df)
    print("Done.")