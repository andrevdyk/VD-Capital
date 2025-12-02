import requests
from bs4 import BeautifulSoup
import pandas as pd

def fetch_matrix_table():
    url = "https://tradingeconomics.com/matrix"

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/123.0.0.0 Safari/537.36"
        ),
    }

    response = requests.get(url, headers=headers)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    table = soup.find("table")

    rows = []
    for tr in table.find_all("tr"):
        cols = [td.get_text(strip=True) for td in tr.find_all(["td", "th"])]
        rows.append(cols)

    # First row = headers
    df = pd.DataFrame(rows[1:], columns=rows[0])
    return df


df = fetch_matrix_table()
print(df)
