import { useState, useRef } from "react";
import { uploadToMassive } from "../lib/massive-storage";

// SECURITY: File upload configuration
const ALLOWED_MIME_TYPES = [
  "text/csv",
  "application/json",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel", // .xls
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 5;

export function FileUploadComponent() {
  const [uploading, setUploading] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState({}); // { filename: percent }
  const inputRef = useRef();

  // SECURITY: Validate file before upload
  function validateFile(file) {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File "${file.name}" exceeds 10 MB limit`;
    }

    // Check file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return `File type "${file.type}" not allowed. Use: CSV, JSON, TXT, XLS, XLSX`;
    }

    // Check file extension (additional validation)
    const allowed = ["csv", "json", "txt", "xlsx", "xls"];
    const ext = file.name.split(".").pop().toLowerCase();
    if (!allowed.includes(ext)) {
      return `Extension ".${ext}" not allowed`;
    }

    return null; // No error
  }

  async function onPick(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // SECURITY: Limit number of files
    if (files.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} files per upload`);
      return;
    }

    setUploading(true);
    setError("");
    setProgress({});

    // SECURITY: Validate all files before uploading
    const validationErrors = [];
    const validFiles = [];

    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) {
        validationErrors.push(validationError);
      } else {
        validFiles.push(file);
      }
    }

    if (validationErrors.length > 0) {
      setError(validationErrors.join("; "));
      setUploading(false);
      e.target.value = "";
      return;
    }

    // Atomic batch upload: rollback all if any fail
    const newItems = [];
    let failed = false;
    for (const file of validFiles) {
      try {
        const url = await uploadToMassive(file, "trading-data", percent => {
          setProgress(prev => ({ ...prev, [file.name]: percent }));
        });
        newItems.push({ name: file.name, url, timestamp: new Date().toLocaleString() });
      } catch (err) {
        setError(`Failed to upload ${file.name}: ${err instanceof Error ? err.message : err}`);
        failed = true;
        break;
      }
    }
    if (failed) {
      setUploading(false);
      setProgress({});
      e.target.value = "";
      return;
    }
    setItems(prev => [...prev, ...newItems]);
    setUploading(false);
    setProgress({});
    e.target.value = "";
  }

  // Responsive style helpers
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;

  return (
    <div style={{ border: "1px solid #3a4558", borderRadius: 10, padding: isMobile ? 8 : 14 }}>
      <div style={{ marginBottom: 8, fontWeight: 700, fontSize: isMobile ? 13 : undefined }}>📁 File Storage (Massive S3)</div>
      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={onPick}
        disabled={uploading}
        accept=".csv,.json,.txt,.xlsx,.xls"
        style={{ fontSize: isMobile ? 12 : undefined }}
        aria-label="Upload files"
      />
      {uploading && <div style={{ marginTop: 8, color: "#00ff88", fontSize: isMobile ? 12 : undefined }}>⏳ Uploading...</div>}
      {error && <div style={{ marginTop: 8, color: "#ff4455", fontSize: isMobile ? "11px" : "12px" }}>⚠️ {error}</div>}
      {Object.keys(progress).length > 0 && (
        <div style={{ marginTop: 8 }}>
          {Object.entries(progress).map(([name, percent]) => (
            <div key={name} style={{ fontSize: isMobile ? 11 : 12 }}>
              {name}: <progress value={percent} max={100} style={{ width: isMobile ? 80 : 120, marginRight: 6 }} /> {percent}%
            </div>
          ))}
        </div>
      )}
      {items.length > 0 && (
        <div style={{ marginTop: 10, fontSize: isMobile ? "11px" : "12px" }}>
          <div style={{ color: "#8b95b8", marginBottom: 8 }}>✓ {items.length} file(s) uploaded</div>
          {items.map((f, i) => (
            <div key={`${f.url}-${i}`} style={{ marginBottom: 6, padding: isMobile ? "4px" : "6px", background: "#242d4a", borderRadius: 4 }}>
              <a href={f.url} target="_blank" rel="noopener noreferrer" style={{ color: "#00d9ff", textDecoration: "none", fontSize: isMobile ? 12 : undefined }}>
                {f.name}
              </a>
              <div style={{ color: "#8b95b8", fontSize: isMobile ? "10px" : "11px", marginTop: "2px" }}>{f.timestamp}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
