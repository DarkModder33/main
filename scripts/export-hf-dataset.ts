import { BOOTSTRAP_DATA, formatForFineTuning } from "../lib/ai/data-ingestion";
import * as fs from 'fs';
import * as path from 'path';

/**
 * TradeHax HF Dataset Exporter
 * Runs as a standalone script to generate training sets for GLM-4.7 Flash.
 */
function exportDataset() {
  console.log("--- TradeHax AI Dataset Export ---");
  
  const datasetPath = path.join(process.cwd(), 'ai-training-set.jsonl');
  const data = formatForFineTuning(BOOTSTRAP_DATA);
  
  try {
    fs.writeFileSync(datasetPath, data);
    console.log(`SUCCESS: Dataset exported to ${datasetPath}`);
    console.log(`TOTAL_SAMPLES: ${BOOTSTRAP_DATA.length}`);
    console.log("NEXT_STEP: Upload to Hugging Face (Hackavelli88/TradeHax) and run AutoTrain with GLM-4.7-Flash-Uncensored.");
  } catch (error) {
    console.error("FAILURE: Could not export dataset.", error);
  }
}

exportDataset();
