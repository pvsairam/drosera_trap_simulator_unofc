// components/StreamLogPanel.tsx
import { TrapResult } from "@/lib/realTimeSimulator";

interface StreamLogPanelProps {
  results: TrapResult[];
}

export function StreamLogPanel({ results }: StreamLogPanelProps) {
  return (
    <div className="bg-black text-green-400 p-4 font-mono text-sm max-h-64 overflow-y-auto rounded-xl border border-green-600">
      <div className="pb-2 text-white">📜 Stream Log (CLI Style)</div>
      {results.length === 0 && <div className="text-gray-500">No logs yet.</div>}
      {results.map((r, i) => (
        <div key={i} className="whitespace-pre-wrap">
          {r.success
            ? `${i + 1}. Block ${r.blockNumber}  ·  ${r.shouldRespond ? "✅ Triggered" : "⏭️ Skipped"}  ·  Gas: ${r.collectData?.gasUsed}`
            : `${i + 1}. ❌ Error - ${r.error}`}
        </div>
      ))}
    </div>
  );
}
