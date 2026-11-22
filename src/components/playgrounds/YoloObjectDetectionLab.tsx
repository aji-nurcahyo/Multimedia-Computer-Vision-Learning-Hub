import React, { useState, useEffect, useRef } from 'react';
import { Download } from 'lucide-react';
import { nonMaxSuppression, type BoundingBox2D } from '../../lib/cvProcessing';

export const YoloObjectDetectionLab: React.FC = () => {
  const [confThreshold, setConfThreshold] = useState<number>(0.35);
  const [nmsIouThreshold, setNmsIouThreshold] = useState<number>(0.45);
  const [detectedBoxes, setDetectedBoxes] = useState<BoundingBox2D[]>([]);
  const [latencyMs, setLatencyMs] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const W = 380;
  const H = 240;

  // Raw candidate detections from simulated YOLO detector grid
  const RAW_DETECTIONS: BoundingBox2D[] = [
    // Car 1 (multiple overlapping predictions from grid cells)
    { id: 1, label: 'Car', x: 40, y: 110, w: 90, h: 60, confidence: 0.92 },
    { id: 2, label: 'Car', x: 44, y: 112, w: 86, h: 58, confidence: 0.78 },
    { id: 3, label: 'Car', x: 38, y: 108, w: 94, h: 62, confidence: 0.54 },
    // Pedestrian
    { id: 4, label: 'Person', x: 170, y: 70, w: 32, h: 80, confidence: 0.88 },
    { id: 5, label: 'Person', x: 172, y: 72, w: 30, h: 78, confidence: 0.65 },
    // Truck
    { id: 6, label: 'Truck', x: 230, y: 90, w: 120, h: 85, confidence: 0.89 },
    { id: 7, label: 'Truck', x: 235, y: 92, w: 115, h: 82, confidence: 0.42 },
    // Weak false positive candidate
    { id: 8, label: 'Bicycle', x: 140, y: 150, w: 30, h: 30, confidence: 0.28 }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = W;
    canvas.height = H;

    const t0 = performance.now();

    // Render Traffic Street Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);

    // Road asphalt
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 100, W, 140);

    // Lane dashes
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 10]);
    ctx.beginPath();
    ctx.moveTo(0, 170);
    ctx.lineTo(W, 170);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw silhouettes of objects
    // Car
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(45, 120, 80, 45);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(60, 105, 50, 18);

    // Person
    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(186, 85, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(178, 95, 16, 50);

    // Truck
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(240, 95, 105, 75);

    // Apply YOLO NMS post-processing
    const filtered = nonMaxSuppression(RAW_DETECTIONS, nmsIouThreshold, confThreshold);
    setDetectedBoxes(filtered);

    // Draw Bounding Boxes and Labels
    for (const b of filtered) {
      const color = b.label === 'Car' ? '#38bdf8' : b.label === 'Person' ? '#34d399' : '#f59e0b';

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(b.x, b.y, b.w, b.h);

      // Label badge
      ctx.fillStyle = color;
      const text = `${b.label} ${(b.confidence * 100).toFixed(0)}%`;
      ctx.font = 'bold 10px monospace';
      const textWidth = ctx.measureText(text).width;
      ctx.fillRect(b.x, Math.max(0, b.y - 16), textWidth + 6, 16);

      ctx.fillStyle = '#0f172a';
      ctx.fillText(text, b.x + 3, Math.max(12, b.y - 4));
    }

    setLatencyMs(performance.now() - t0 + 2.4); // simulated fast edge inference
  }, [confThreshold, nmsIouThreshold]);

  const handleExportDetections = () => {
    let csv = 'detection_id,class_label,x,y,width,height,confidence\n';
    detectedBoxes.forEach((b, idx) => {
      csv += `${idx + 1},${b.label},${b.x},${b.y},${b.w},${b.h},${b.confidence.toFixed(3)}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'yolo_detections_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card" style={{ padding: '1.75rem', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>
          Laboratorium Deteksi Objek YOLO &amp; Non-Maximum Suppression (Bab 44)
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Penyaringan duplikasi deteksi kandidat menggunakan Intersection-over-Union (IoU), pemfilteran ambang keyakinan, dan visualisasi bounding box.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 1.2fr', gap: '1.5rem', alignItems: 'start' }}>
        <div>
          <div style={{ background: '#020617', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
              <span>Visualisasi Deteksi YOLOv8</span>
              <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>Latensi: {latencyMs.toFixed(1)} ms</span>
            </div>
            <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto', borderRadius: '4px' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Total Objek Terpilih: <strong style={{ color: '#34d399' }}>{detectedBoxes.length}</strong>
            </span>
            <button
              onClick={handleExportDetections}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                background: '#10b981',
                color: '#fff',
                fontSize: '0.78rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Download size={13} /> Ekspor CSV
            </button>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', display: 'block', marginBottom: '0.75rem' }}>
              Parameter Pasca-Pemrosesan YOLO:
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span>Ambang Batas Keyakinan (Confidence):</span>
                  <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{(confThreshold * 100).toFixed(0)}%</strong>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={0.9}
                  step={0.05}
                  value={confThreshold}
                  onChange={(e) => setConfThreshold(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span>Ambang Batas NMS IoU:</span>
                  <strong style={{ color: '#fbbf24', fontFamily: 'monospace' }}>{nmsIouThreshold.toFixed(2)}</strong>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={0.8}
                  step={0.05}
                  value={nmsIouThreshold}
                  onChange={(e) => setNmsIouThreshold(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                  IoU lebih rendah menekan kotak tumpang tindih secara lebih agresif.
                </span>
              </div>
            </div>
          </div>

          <div style={{ background: '#020617', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.8rem' }}>
            <span style={{ color: '#34d399', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
              Daftar Objek Terdeteksi:
            </span>
            {detectedBoxes.map((b) => (
              <div key={b.id || b.x} style={{ display: 'flex', justifyContent: 'space-between', color: '#e2e8f0', marginBottom: '0.2rem' }}>
                <span>• {b.label} [x:{b.x}, y:{b.y}, w:{b.w}, h:{b.h}]</span>
                <strong style={{ color: '#34d399', fontFamily: 'monospace' }}>{(b.confidence * 100).toFixed(1)}%</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
