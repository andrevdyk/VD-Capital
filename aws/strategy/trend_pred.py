import pandas as pd
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
from sklearn.preprocessing import StandardScaler
import ta
import plotly.graph_objects as go

# ------------------------- TOGGLES / HYPERPARAMS -------------------------
CSV_FILE = "Data1min_1.csv"        # your 1-min CSV (Date,Time,Open,High,Low,Close[,Volume])
SEQ_LEN = 20                 # how many past bars the LSTM sees
CONSISTENCY_N = 2            # require N consecutive future closes in same dir to label up/down
TRAIN_TEST_SPLIT = 0.8       # fraction for training
BATCH_SIZE = 64
EPOCHS = 30
LR = 0.001
THRESHOLD = 0.0              # optional additional price threshold (leave 0 if using strict consistency)
START_HOUR, END_HOUR = 8, 17 # prediction window inclusive
MAX_PLOT_BARS = 500         # how many 1-min bars to show on plot (reduce if laggy)

# Feature toggles (set False to omit)
USE_RSI = True
USE_MACD = True
USE_ATR = True
USE_BB = True
USE_LAG_RETURNS = True
LAG_RETURNS = [1,2,3]        # lags for return features

# Device
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", DEVICE)

# ------------------------- LOAD & BASE PREPROCESS -------------------------
df_1min = pd.read_csv(CSV_FILE)
# combine Date + Time into datetime
df_1min["time"] = pd.to_datetime(df_1min["Date"].astype(str) + " " + df_1min["Time"].astype(str),
                                 errors="coerce")
df_1min = df_1min.drop(columns=[c for c in ["Date","Time"] if c in df_1min.columns])
df_1min = df_1min.rename(columns=str.lower).dropna(subset=["time"]).reset_index(drop=True)

# ensure numeric columns exist
for col in ["open","high","low","close"]:
    if col not in df_1min.columns:
        raise ValueError(f"Missing required column: {col}")

# ------------------------- FEATURE ENGINEERING -------------------------
df = df_1min.copy()  # work on a copy for features/labels

# basic features
df["return"] = df["close"].pct_change()
df["hl_range"] = df["high"] - df["low"]

# indicators (use ta library)
if USE_RSI:
    df["rsi"] = ta.momentum.RSIIndicator(df["close"]).rsi()
if USE_MACD:
    df["macd"] = ta.trend.MACD(df["close"]).macd()
if USE_ATR:
    df["atr"] = ta.volatility.AverageTrueRange(df["high"], df["low"], df["close"]).average_true_range()
if USE_BB:
    bb = ta.volatility.BollingerBands(df["close"])
    df["bb_width"] = bb.bollinger_hband() - bb.bollinger_lband()

# lagged returns
if USE_LAG_RETURNS:
    for lag in LAG_RETURNS:
        df[f"ret_lag_{lag}"] = df["return"].shift(lag)

# drop initial NA rows from indicators
df = df.dropna().reset_index(drop=True)

# ------------------------- TREND-CONSISTENCY LABELS -------------------------
# Label as UP if the next CONSISTENCY_N closes are all > current close
# Label as DOWN if next CONSISTENCY_N closes are all < current close
# Else label = -1 (uncertain) and will be skipped.
def make_consistency_labels(df, consistency_n=CONSISTENCY_N, threshold=THRESHOLD):
    closes = df["close"].values
    n = len(closes)
    labels = np.full(n, -1, dtype=int)
    for i in range(n - consistency_n):
        future = closes[i+1:i+1+consistency_n]
        # require all future > current + threshold --> UP
        if np.all(future > closes[i] + threshold):
            labels[i] = 1
        # require all future < current - threshold --> DOWN
        elif np.all(future < closes[i] - threshold):
            labels[i] = 0
        else:
            labels[i] = -1
    # last consistency_n positions remain -1 (no label)
    return labels

df["label_consistency"] = make_consistency_labels(df, CONSISTENCY_N, THRESHOLD)

# ------------------------- BUILD SEQUENCES (only keep seqs that end on 5-min & trading hours) -------------------------
# Allowed end times: minute % 5 == 0 AND hour in [START_HOUR..END_HOUR]
feature_cols = [c for c in df.columns if c not in ("time","label_consistency")]
# ensure stable ordering
feature_cols = [c for c in ["open","high","low","close","return","hl_range","rsi","macd","atr","bb_width"] if c in df.columns] \
               + [c for c in df.columns if c.startswith("ret_lag_")]
feature_cols = [c for c in feature_cols if c in df.columns]  # final clean

X_seqs = []
y_seqs = []
times_seqs = []
closes_seqs = []

vals = df[feature_cols].values
labels = df["label_consistency"].values
times = df["time"].values
closes = df["close"].values

for i in range(len(vals) - SEQ_LEN):
    end_idx = i + SEQ_LEN - 1
    t = pd.Timestamp(times[end_idx])
    # only keep sequences whose end is a 5-min interval inside trading window
    if not (START_HOUR <= t.hour <= END_HOUR and t.minute % 5 == 0):
        continue
    label = labels[end_idx]
    if label == -1:
        continue
    seq = vals[i:i+SEQ_LEN]
    X_seqs.append(seq)
    y_seqs.append(label)
    times_seqs.append(times[end_idx])
    closes_seqs.append(closes[end_idx])

if len(X_seqs) == 0:
    raise ValueError("No sequences produced — check SEQ_LEN, CONSISTENCY_N, data density, and trading hours.")

X_seqs = np.array(X_seqs)        # shape (N, SEQ_LEN, feats)
y_seqs = np.array(y_seqs)        # shape (N,)
times_seqs = np.array(times_seqs)
closes_seqs = np.array(closes_seqs)

# ------------------------- SCALE FEATURES (fit on full sequences input data) -------------------------
# We'll scale per-feature across all sequence rows and timesteps
n_samples, seq_len, n_feats = X_seqs.shape
X_reshaped = X_seqs.reshape(-1, n_feats)  # (N*SEQ_LEN, feats)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_reshaped).reshape(n_samples, seq_len, n_feats)

# ------------------------- TRAIN/TEST SPLIT (time-ordered) -------------------------
split_idx = int(len(X_scaled) * TRAIN_TEST_SPLIT)
X_train = X_scaled[:split_idx]
y_train = y_seqs[:split_idx]
X_test = X_scaled[split_idx:]
y_test = y_seqs[split_idx:]
times_test = times_seqs[split_idx:]
closes_test = closes_seqs[split_idx:]

print(f"Sequences total: {len(X_scaled)}, train: {len(X_train)}, test: {len(X_test)}")

# create torch datasets
train_ds = TensorDataset(torch.tensor(X_train, dtype=torch.float32),
                         torch.tensor(y_train, dtype=torch.long))
test_ds = TensorDataset(torch.tensor(X_test, dtype=torch.float32),
                        torch.tensor(y_test, dtype=torch.long))
train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True)
test_loader = DataLoader(test_ds, batch_size=BATCH_SIZE, shuffle=False)

# ------------------------- MODEL (LSTM) -------------------------
class LSTMClassifier(nn.Module):
    def __init__(self, input_size, hidden_size=128, num_layers=2, num_classes=2, dropout=0.2):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers,
                            batch_first=True, dropout=dropout)
        self.fc = nn.Linear(hidden_size, num_classes)

    def forward(self, x):
        # x: [batch, seq_len, features]
        out, _ = self.lstm(x)            # out: [batch, seq_len, hidden]
        last = out[:, -1, :]             # take last timestep
        logits = self.fc(last)           # [batch, num_classes]
        return logits

model = LSTMClassifier(input_size=n_feats, hidden_size=128, num_layers=2).to(DEVICE)
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=LR)

# ------------------------- TRAIN -------------------------
for epoch in range(1, EPOCHS+1):
    model.train()
    total_loss = 0.0
    for xb, yb in train_loader:
        xb, yb = xb.to(DEVICE), yb.to(DEVICE)
        optimizer.zero_grad()
        logits = model(xb)
        loss = criterion(logits, yb)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
    avg_loss = total_loss / max(1, len(train_loader))
    if epoch % 10 == 0 or epoch == 1:
        print(f"Epoch {epoch}/{EPOCHS}  loss={avg_loss:.4f}")

# ------------------------- EVALUATE -------------------------
model.eval()
preds = []
probs = []
with torch.no_grad():
    for xb, yb in test_loader:
        xb = xb.to(DEVICE)
        logits = model(xb)
        p = torch.softmax(logits, dim=1).cpu().numpy()
        pred = np.argmax(p, axis=1)
        preds.extend(pred)
        probs.extend(p)

preds = np.array(preds)
probs = np.array(probs)
y_test_arr = np.array(y_test)   # ground truth for test set

acc = (preds == y_test_arr).mean()
print(f"Test accuracy: {acc*100:.2f}%    (N_test={len(y_test_arr)})")

# ------------------------- PREPARE PLOT DATA -------------------------
# Use original 1-min df for candlestick plotting; overlay markers at times_test
# Limit main plot to last MAX_PLOT_BARS 1-min bars
df_plot = df_1min.copy().reset_index(drop=True)
if len(df_plot) > MAX_PLOT_BARS:
    df_plot = df_plot.iloc[-MAX_PLOT_BARS:]

# Build overlay markers only where times_test fall within plotted timeframe
# times_test are numpy datetimes; convert to pandas Timestamp for easy isin
times_test_ts = pd.to_datetime(times_test)
mask_in_plot = (times_test_ts >= df_plot["time"].iloc[0]) & (times_test_ts <= df_plot["time"].iloc[-1])
overlay_times = times_test_ts[mask_in_plot]
overlay_closes = closes_test[mask_in_plot]
overlay_preds = preds[mask_in_plot]
overlay_probs = probs[mask_in_plot]

# assemble symbol strings arrow + check
arrow = np.where(overlay_preds == 1, "↑", "↓")
correct = np.where(overlay_preds == y_test_arr[mask_in_plot], "✓", "✗")
symbols = [f"{a}{c}" for a,c in zip(arrow, correct)]

# marker opacity from probability of predicted class
pred_class_probs = overlay_probs[np.arange(len(overlay_preds)), overlay_preds]
# scale to [0.25,1] for visibility
opacities = 0.25 + 0.75 * (pred_class_probs - pred_class_probs.min()) / max(1e-9, pred_class_probs.max()-pred_class_probs.min())

# ------------------------- PLOTLY VISUALIZATION -------------------------
fig = go.Figure()

fig.add_trace(go.Candlestick(
    x=df_plot["time"],
    open=df_plot["open"],
    high=df_plot["high"],
    low=df_plot["low"],
    close=df_plot["close"],
    name="1-min Price"
))

# overlay text symbols at 5-min prediction bars
fig.add_trace(go.Scatter(
    x=overlay_times,
    y=overlay_closes,
    mode="text",
    text=symbols,
    textfont=dict(size=12),
    marker=dict(opacity=opacities),
    name="Pred ↑/↓ + ✓/✗"
))

# optionally add a separate small colored dot showing confidence (green for up, red for down)
fig.add_trace(go.Scatter(
    x=overlay_times,
    y=overlay_closes,
    mode="markers",
    marker=dict(
        size=8,
        color=np.where(overlay_preds==1, "green", "red"),
        opacity=opacities
    ),
    name="Confidence dot"
))

fig.update_layout(
    title=f"1-min Candles with 5-min Predictions (SEQ_LEN={SEQ_LEN}, CONSIST_N={CONSISTENCY_N})",
    xaxis_title="Time",
    yaxis_title="Price",
    xaxis_rangeslider_visible=False
)

fig.show()

# ------------------------- NOTES -------------------------
print("Done. Tweak SEQ_LEN, CONSISTENCY_N, features toggles, EPOCHS, LR and try again.")
