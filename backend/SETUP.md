# SETUP INSTRUCTIONS

## Install Vosk

```bash
cd backend
pip install -r requirements.txt
```

## Download Vosk Model

1. Download: https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip
2. Extract to `backend/model/`
3. Structure should be:
```
backend/
  model/
    am/
    conf/
    graph/
    ivector/
```

## Run Backend

```bash
python app.py
```

## How It Works

1. User says "tap" (but should say "hot")
2. Vosk detects: "tap"
3. CMU Dict: "tap" = [T, AE, P]
4. Expected: "hot" = [HH, AA, T]
5. Compare: [T, AE, P] vs [HH, AA, T]
6. Result: 0% - All phonemes wrong
7. Feedback: "You said 'tap' instead of 'hot'"

## Test

1. Start backend
2. Say "hot" correctly → 85-95%
3. Say "tap" instead → 0% + "You said 'tap' instead of 'hot'"
4. Say "hit" instead → 33% + "Expected HH-AA-T but detected HH-IH-T"
