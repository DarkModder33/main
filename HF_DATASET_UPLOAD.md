# Hugging Face Dataset Upload Instructions

## ✅ Your Training Data is Ready

File: `ai-training-set.jsonl` (5.73 KB)
Format: JSONL (JSON Lines) - 26 instruction-response pairs

### Step 1: Create Dataset Repository

1. Go to: https://huggingface.co/new-dataset
2. Fill in:
   - **Name**: `tradehax-behavioral`
   - **Description**: `TradeHax AI behavioral training dataset - Q&A pairs for fine-tuning language models`
   - **License**: `openrail` (or your preferred license)
   - **Private**: Leave unchecked (public)
3. Click "Create dataset"

### Step 2: Upload Training File

After creating the dataset:

1. Go to: https://huggingface.co/datasets/DarkModder33/tradehax-behavioral
2. Click "Upload files" or go to the Files tab
3. Drag & drop or select `ai-training-set.jsonl`
4. Click "Upload"

### Step 3: Verify Upload

You should see your file in the dataset with:
- ✅ File size: ~5.7 KB
- ✅ Format: JSONL (properly recognized)
- ✅ Preview: Shows the JSON structure

---

## 📊 Training Data Contents

26 Q&A pairs covering:
- What is TradeHax
- Getting started
- Blockchain integration
- Token rewards (THX)
- Prediction accuracy
- Trading pairs
- Security features
- Wallet connection
- Hyperborea game
- NFT skins
- Community features
- API & automation
- Technical details
- Support & troubleshooting

### Sample Entry:
```json
{"instruction": "What is TradeHax?", "response": "TradeHax is an AI-powered trading analysis platform that combines blockchain technology with advanced machine learning..."}
```

---

## 🚀 Next Steps

After uploading to Hugging Face, you can:

### 1. Fine-tune a Model
```bash
# Using Hugging Face Trainer
python -m transformers.training --model_name mistral-7b \
  --dataset_name DarkModder33/tradehax-behavioral
```

### 2. Use for Few-Shot Learning
```python
from datasets import load_dataset

dataset = load_dataset("DarkModder33/tradehax-behavioral")
for example in dataset['train']:
    print(f"Q: {example['instruction']}")
    print(f"A: {example['response']}\n")
```

### 3. Integrate with Your LLM
```typescript
// In your HF inference code
const dataset = await loadDataset("DarkModder33/tradehax-behavioral");
// Use for context injection or fine-tuning
```

### 4. Expand the Dataset
Add more training examples to improve model accuracy:
- Technical documentation
- Common user issues
- Trading strategies
- Community FAQs

---

## 📝 Dataset Format

JSONL format (one JSON object per line):

```
{"instruction": "...", "response": "..."}
{"instruction": "...", "response": "..."}
...
```

### Fields:
- **instruction**: User query or question
- **response**: Model output or answer

This format is compatible with:
- Hugging Face Transformers
- LLaMA fine-tuning
- OpenAI fine-tuning
- Other popular frameworks

---

## 🔗 Quick Links

- **Create Dataset**: https://huggingface.co/new-dataset
- **Your Dataset** (after creation): https://huggingface.co/datasets/DarkModder33/tradehax-behavioral
- **Upload Files**: https://huggingface.co/datasets/DarkModder33/tradehax-behavioral/upload/main
- **Hugging Face Hub**: https://huggingface.co

---

## 💡 Tips

1. **Keep updating**: Add more Q&A pairs over time for better model performance
2. **Version control**: Use Git LFS for large datasets
3. **Documentation**: Add a README.md to your dataset repo
4. **License**: Clearly specify your license for legal clarity
5. **Community**: Make it public to let others use/cite your data

---

## ✨ Your Training File is Ready to Upload

The file `ai-training-set.jsonl` contains everything needed. Just upload it to your new Hugging Face dataset!

Run this command after creating the dataset (if you have curl):

```bash
$env:HF_TOKEN="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"
curl -X POST `
  -H "Authorization: Bearer $env:HF_TOKEN" `
  -F "file=@ai-training-set.jsonl" `
  "https://huggingface.co/api/datasets/DarkModder33/tradehax-behavioral/upload/main/ai-training-set.jsonl"
```

Or use the web interface (recommended) at the links above!
