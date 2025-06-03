import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CodeEditor } from "@/components/CodeEditor";
import { OutputPanel } from "@/components/OutputPanel";
import { useToast } from "@/hooks/use-toast";
import { TRAP_PRESETS } from "@/lib/trapPresets";
import { simulateTrap, TrapResult } from "@/lib/trapSimulator";
import { EnhancedCodeEditor } from "@/components/EnhancedCodeEditor";
import { ENHANCED_TRAP_PRESETS } from "@/lib/enhancedTrapPresets";

export function TrapSimulator() {
  const [code, setCode] = useState(ENHANCED_TRAP_PRESETS["example"].code);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<TrapResult | null>(null);
  const { toast } = useToast();

  const handlePresetChange = (presetKey: string) => {
    if (presetKey && ENHANCED_TRAP_PRESETS[presetKey]) {
      setCode(ENHANCED_TRAP_PRESETS[presetKey].code);
      setOutput(null);
      toast({
        title: "Preset Loaded",
        description: `Loaded ${ENHANCED_TRAP_PRESETS[presetKey].name} preset`,
      });
    }
  };

  const handleRunTrap = async () => {
    setIsRunning(true);
    setOutput(null);

    try {
      // Validate code contains required functions
      if (!code.includes("function collect()") || !code.includes("function shouldRespond(")) {
        throw new Error("Code must include both collect() and shouldRespond() functions");
      }

      const result = await simulateTrap(code);
      setOutput(result);

      if (result.success) {
        toast({
          title: "✅ Trap Executed Successfully",
          description: result.shouldRespond ? "Trap matched! shouldRespond() returned true." : "Trap skipped. shouldRespond() returned false.",
        });
      } else {
        toast({
          title: "⚠️ Execution Error",
          description: result.error || "Compilation error or revert. See details below.",
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setOutput({
        success: false,
        error: errorMessage,
        details: "Failed to execute trap simulation"
      });
      
      toast({
        title: "❌ Execution Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Choose a Preset Trap</label>
          <Select onValueChange={handlePresetChange}>
            <SelectTrigger className="w-full sm:w-[300px] rounded-xl">
              <SelectValue placeholder="Select a preset..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {Object.entries(ENHANCED_TRAP_PRESETS).map(([key, preset]) => (
                <SelectItem key={key} value={key} className="rounded-lg">
                  {preset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button
          onClick={handleRunTrap}
          disabled={isRunning}
          size="lg"
          className="rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8"
          title="Run trap against the last 5 blocks from live EVM data."
        >
          {isRunning ? "Running..." : "🚀 Run Trap"}
        </Button>
      </div>

      {/* Code Editor */}
      <Card className="rounded-2xl border-amber-200 dark:border-amber-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                💻 Trap Code Editor
                <Badge variant="outline" className="rounded-full bg-amber-100 dark:bg-amber-900 border-amber-300 dark:border-amber-700">Solidity</Badge>
              </CardTitle>
              <CardDescription>Write your trap logic here</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <EnhancedCodeEditor
            value={code}
            onChange={setCode}
            language="solidity"
            height="400px"
          />
          <div className="p-4 border-t bg-amber-50/50 dark:bg-amber-900/20">
            <p className="text-sm text-muted-foreground">
              💡 Include both collect() and shouldRespond(). Only Solidity is allowed.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Output Panel */}
      {output && (
        <Card className="rounded-2xl border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle>🎯 Trap Execution Output</CardTitle>
            <CardDescription>Results from simulation against live EVM data</CardDescription>
          </CardHeader>
          <CardContent>
            <OutputPanel output={output} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
