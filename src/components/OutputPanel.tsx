
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrapResult } from "@/lib/trapSimulator";

interface OutputPanelProps {
  output: TrapResult;
}

export function OutputPanel({ output }: OutputPanelProps) {
  const getStatusBadge = () => {
    if (!output.success) {
      return <Badge variant="destructive" className="rounded-full">❌ Error</Badge>;
    }
    if (output.shouldRespond) {
      return <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-full text-white">✅ Matched</Badge>;
    }
    return <Badge variant="secondary" className="rounded-full bg-gray-500 text-white">⏭️ Skipped</Badge>;
  };

  const getStatusMessage = () => {
    if (!output.success) {
      return "⚠️ Compilation error or revert. See details below.";
    }
    if (output.shouldRespond) {
      return "✅ Trap matched! shouldRespond() returned true.";
    }
    return "❌ Trap skipped. shouldRespond() returned false.";
  };

  return (
    <div className="space-y-4">
      {/* Status */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <span className="text-sm font-medium">Execution Result</span>
          </div>
          <p className="text-sm text-muted-foreground">{getStatusMessage()}</p>
        </div>
        {output.blockNumber && (
          <Badge variant="outline" className="rounded-full border-orange-300 dark:border-orange-700 bg-orange-100 dark:bg-orange-900">
            Block #{output.blockNumber}
          </Badge>
        )}
      </div>

      <Separator className="bg-orange-200 dark:bg-orange-800" />

      {/* Success Output */}
      {output.success && (
        <div className="grid gap-4">
          <Card className="rounded-xl border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50/50 to-red-50/50 dark:from-orange-950/20 dark:to-red-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">📊 Decoded collect() Output</CardTitle>
            </CardHeader>
            <CardContent>
              {/* 👇 Added scroll container to prevent overflow and show scrollbar when data is tall */}
              <div className="max-h-64 overflow-y-auto">
              
              {/* ⬇️ Automatically expanding JSON block — Start */}
              <pre className="bg-slate-100 dark:bg-slate-900 p-3 rounded-lg text-sm whitespace-pre-wrap break-words border border-orange-200 dark:border-orange-800">
              {JSON.stringify(output.collectData, null, 2)}
              </pre>
              {/* ⬆️ Automatically expanding JSON block — End */}

              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50/50 to-red-50/50 dark:from-orange-950/20 dark:to-red-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">🔍 shouldRespond() Result</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={output.shouldRespond ? "default" : "secondary"} 
                  className={`rounded-full ${output.shouldRespond 
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white" 
                    : "bg-gray-500 text-white"
                  }`}
                >
                  {output.shouldRespond ? "true" : "false"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {output.shouldRespond ? "Trap will execute" : "Trap will be skipped"}
                </span>
              </div>
            </CardContent>
          </Card>

          {output.rawBytes && (
            <Card className="rounded-xl border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50/50 to-red-50/50 dark:from-orange-950/20 dark:to-red-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">🔢 Raw Bytes</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-100 dark:bg-slate-900 p-3 rounded-lg text-sm break-all border border-orange-200 dark:border-orange-800">
                  {output.rawBytes}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Error Output */}
      {!output.success && (
        <Card className="rounded-xl border-red-200 dark:border-red-800 bg-gradient-to-r from-red-50/50 to-pink-50/50 dark:from-red-950/20 dark:to-pink-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-red-600 dark:text-red-400">❌ Error Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-medium text-sm">Error Message:</p>
              <pre className="bg-red-50 dark:bg-red-950 p-3 rounded-lg text-sm text-red-800 dark:text-red-200 mt-1 border border-red-200 dark:border-red-800">
                {output.error}
              </pre>
            </div>
            {output.details && (
              <div>
                <p className="font-medium text-sm">Additional Details:</p>
                <pre className="bg-slate-100 dark:bg-slate-900 p-3 rounded-lg text-sm mt-1 border border-orange-200 dark:border-orange-800">
                  {output.details}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
