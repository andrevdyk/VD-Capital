import pandas as pd
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import ta
import plotly.graph_objects as go

# ------------------- TOGGLE FEATURES -------------------
# All feature set to false = 38.22% accuracy
# Lags only = 40.03%
# Lags + RSI = 39.11%
# Lags + MACD = 40.39%
# Lags + ATR = 
# Lags + BB Width = 
# Lags + RSI + MACD = 41.36
# Lags + RSI + MACD + ATR = 41.60%
# Lags + RSI + MACD + ATR + BB Width = 41.70%
# RSI only = 38.74%
# RSI + MACD = 40.15%
# RSI + MACD + ATR = 42.32%
# RSI + MACD + ATR + BB Width = 42.98%
# MACD only = 40.02%
# MACD + ATR = 41.69%
# MACD + ATR + BB Width =41.34%
# ATR only = 42.06%
# ATR + BB Width = 42.02%
# BB Width only = 41.39%
USE_LAGS = False
LAG_BARS = 5
USE_RSI = True
USE_MACD = True
USE_ATR = True
USE_BB_WIDTH = True
USE_MULTI_TIMEFRAME = False
PLOT_CANDLESTICKS = False
PLOT_PROB_MARKERS = True
MAX_PLOT_BARS = 500

# ------------------- PARAMETERS -------------------
#Thresholds: 0.0002 = 60.74%, 0.0003 = 74.26%, 0.0005 = 89.16%, 0.0008 = 96.63%

CSV_FILE = "data15.csv"
HORIZON = 4      # predict next 5 min
THRESHOLD = 0   # threshold for flat
EPOCHS = 50
BATCH_SIZE = 64
LR = 0.001

# ------------------- DEVICE -------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)

# ------------------- LOAD DATA -------------------
df = pd.read_csv(CSV_FILE)
df["time"] = pd.to_datetime(df["Date"].astype(str) + " " + df["Time"].astype(str), errors="coerce")
df = df.drop(columns=["Date", "Time"]).dropna(subset=["time"]).reset_index(drop=True)
df = df.rename(columns=str.lower)

# ------------------- TECHNICAL INDICATORS -------------------
if USE_RSI:
    df["rsi"] = ta.momentum.RSIIndicator(df["close"]).rsi()
if USE_MACD:
    df["macd"] = ta.trend.MACD(df["close"]).macd()
if USE_ATR:
    df["atr"] = ta.volatility.AverageTrueRange(df["high"], df["low"], df["close"]).average_true_range()
if USE_BB_WIDTH:
    bb = ta.volatility.BollingerBands(df["close"])
    df["bb_width"] = bb.bollinger_hband() - bb.bollinger_lband()

# ------------------- LAGGED FEATURES -------------------
if USE_LAGS:
    lag_cols = ["open", "high", "low", "close", "rsi", "macd", "atr", "bb_width"]
    for col in lag_cols:
        if col in df.columns:
            for lag in range(1, LAG_BARS+1):
                df[f"{col}_lag{lag}"] = df[col].shift(lag)

df = df.dropna().reset_index(drop=True)

# ------------------- LABELS -------------------
df["future_close"] = df["close"].shift(-HORIZON)
df["target"] = np.where(df["future_close"] > df["close"] + THRESHOLD, 1,
                        np.where(df["future_close"] < df["close"] - THRESHOLD, 0, 2))
df = df.dropna().reset_index(drop=True)

# ------------------- FILTER 5-MIN INTERVALS & TRADING HOURS -------------------
df["minute"] = df["time"].dt.minute
df = df[df["minute"] % 5 == 0]               # 5-min intervals
df = df[(df["time"].dt.hour >= 8) & (df["time"].dt.hour <= 17)]

features = [col for col in df.columns if col not in ["time", "future_close", "target", "minute"]]
X = df[features].values
y = df["target"].values
time_vals = df["time"].values
close_vals = df["close"].values

# ------------------- NORMALIZE -------------------
scaler = StandardScaler()
X = scaler.fit_transform(X)

# ------------------- TRAIN/TEST SPLIT -------------------
X_train, X_test, y_train, y_test, time_train, time_test, close_train, close_test = train_test_split(
    X, y, time_vals, close_vals, test_size=0.2, shuffle=False
)

X_train_tensor = torch.tensor(X_train, dtype=torch.float32).to(device)
y_train_tensor = torch.tensor(y_train, dtype=torch.long).to(device)
X_test_tensor = torch.tensor(X_test, dtype=torch.float32).to(device)
y_test_tensor = torch.tensor(y_test, dtype=torch.long).to(device)

train_loader = DataLoader(TensorDataset(X_train_tensor, y_train_tensor), batch_size=BATCH_SIZE, shuffle=True)

# ------------------- MODEL -------------------
class LSTMClassifier(nn.Module):
    def __init__(self, input_dim, hidden_dim=512, num_layers=2, num_classes=3):
        super(LSTMClassifier, self).__init__()
        self.lstm = nn.LSTM(input_dim, hidden_dim, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_dim, num_classes)
        self.softmax = nn.Softmax(dim=1)

    def forward(self, x):
        x = x.unsqueeze(1)  # seq_len=1
        out, _ = self.lstm(x)
        out = self.fc(out[:, -1, :])
        return self.softmax(out)

model = LSTMClassifier(X_train.shape[1]).to(device)
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=LR)

# ------------------- TRAIN -------------------
for epoch in range(EPOCHS):
    model.train()
    total_loss = 0
    for xb, yb in train_loader:
        optimizer.zero_grad()
        preds = model(xb)
        loss = criterion(preds, yb)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
    if (epoch+1) % 10 == 0:
        print(f"Epoch {epoch+1}/{EPOCHS}, Loss: {total_loss/len(train_loader):.4f}")

# ------------------- EVALUATE -------------------
model.eval()
with torch.no_grad():
    preds_probs = model(X_test_tensor).cpu().numpy()
    preds_class = np.argmax(preds_probs, axis=1)
    prob_up = preds_probs[:,1]
    prob_down = preds_probs[:,0]

accuracy = (preds_class == y_test).mean()
print(f"Test Accuracy: {accuracy:.2%}")

# ------------------- CORRECTNESS MARKERS -------------------
correct_markers = np.where(preds_class == y_test, "✓", "✗")

# ------------------- PLOTLY VISUALIZATION -------------------
if PLOT_CANDLESTICKS:
    # Limit bars for performance
    df_plot = df[-MAX_PLOT_BARS:]  # full 1-min bars
    time_plot = df_plot["time"]
    close_plot = df_plot["close"]

    # Find indices of 5-min interval candles (already filtered)
    five_min_mask = df_plot["minute"] % 5 == 0
    five_min_times = df_plot["time"][five_min_mask]
    five_min_close = df_plot["close"][five_min_mask]
    
    # Corresponding predictions & correctness
    preds_class_5min = preds_class[np.isin(time_test, five_min_times)]
    correct_5min = correct_markers[np.isin(time_test, five_min_times)]
    
    # Arrows for prediction direction
    arrows = np.where(preds_class_5min == 1, "↑",
                      np.where(preds_class_5min == 0, "↓", "–"))
    symbols = np.array([f"{ar}{c}" for ar, c in zip(arrows, correct_5min)])

    fig = go.Figure()

    # Full 1-min candlestick chart
    fig.add_trace(go.Candlestick(
        x=time_plot,
        open=df_plot["open"],
        high=df_plot["high"],
        low=df_plot["low"],
        close=df_plot["close"],
        name="Price"
    ))

    # Symbols & arrows on 5-min candles only
    fig.add_trace(go.Scatter(
        x=five_min_times,
        y=five_min_close,
        mode="text",
        text=symbols,
        textposition="top center",
        name="Prediction / Correctness"
    ))

    fig.update_layout(
        title=f"EURUSD Predicted Movement (Next {HORIZON} min)",
        xaxis_title="Time",
        yaxis_title="Price"
    )
    fig.show()
