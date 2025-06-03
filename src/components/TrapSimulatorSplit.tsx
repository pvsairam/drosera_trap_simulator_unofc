
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EnhancedCodeEditor } from "@/components/EnhancedCodeEditor";
import { OutputPanel } from "@/components/OutputPanel";
import { StreamLogPanel } from "@/components/StreamLogPanel";
import { useToast } from "@/hooks/use-toast";
import { ENHANCED_TRAP_PRESETS } from "@/lib/enhancedTrapPresets";
import { trapSimulator, TrapResult } from "@/lib/realTimeSimulator";
import { Play, Square, RotateCcw } from "lucide-react";

export function TrapSimulatorSplit() {
  const [code, setCode] = useState(ENHANCED_TRAP_PRESETS["example"].code);
  const [isRunning, setIsRunning] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [output, setOutput] = useState<TrapResult | null>(null);
  const [streamResults, setStreamResults] = useState<TrapResult[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (trapSimulator.isStreaming()) {
        trapSimulator.stopStream();
      }
    };
  }, []);

  const handlePresetChange = (presetKey: string) => {
    if (presetKey && ENHANCED_TRAP_PRESETS[presetKey]) {
      setCode(ENHANCED_TRAP_PRESETS[presetKey].code);
      setOutput(null);
      setStreamResults([]);
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
      if (!code.includes("function collect()") || !code.includes("function shouldRespond(")) {
        throw new Error("Code must include both collect() and shouldRespond() functions");
      }

      const result = await trapSimulator.simulateTrap(code);
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

  const handleStartStream = () => {
    if (!code.includes("function collect()") || !code.includes("function shouldRespond(")) {
      toast({
        title: "❌ Invalid Code",
        description: "Code must include both collect() and shouldRespond() functions",
        variant: "destructive",
      });
      return;
    }

    setIsStreaming(true);
    trapSimulator.startStream(code, (result) => {
      setStreamResults(prev => [...prev.slice(-9), result]); // Keep last 10 results
      setOutput(result);
    });

    toast({
      title: "🔄 Stream Started",
      description: "Monitoring blockchain in real-time every 15 seconds",
    });
  };

  const handleStopStream = () => {
    setIsStreaming(false);
    trapSimulator.stopStream();
    toast({
      title: "⏹️ Stream Stopped",
      description: "Real-time monitoring has been stopped",
    });
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Choose a Preset Trap</label>
          <Select onValueChange={handlePresetChange}>
            <SelectTrigger className="w-full lg:w-[300px] rounded-xl">
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
        
        <div className="flex gap-2">
          <Button
            onClick={handleRunTrap}
            disabled={isRunning || isStreaming}
            size="lg"
            className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6"
            title="Run trap once against current block"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            {isRunning ? "Running..." : "Run Trap"}
          </Button>
          
          {!isStreaming ? (
            <Button
              onClick={handleStartStream}
              disabled={isRunning}
              size="lg"
              className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6"
              title="Start real-time monitoring"
            >
              <Play className="mr-2 h-4 w-4" />
              Start Stream
            </Button>
          ) : (
            <Button
              onClick={handleStopStream}
              size="lg"
              variant="destructive"
              className="rounded-xl px-6"
              title="Stop real-time monitoring"
            >
              <Square className="mr-2 h-4 w-4" />
              Stop Stream
            </Button>
          )}
        </div>
      </div>

      {/* Stream Status */}
      {isStreaming && (
        <Card className="rounded-2xl border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Streaming live blockchain data • {streamResults.length} blocks processed
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Split View */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Side - Code Editor */}
        <Card className="rounded-2xl border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              💻 Trap Code Editor
              <Badge variant="outline" className="rounded-full bg-amber-100 dark:bg-amber-900 border-amber-300 dark:border-amber-700">
                Solidity
              </Badge>
            </CardTitle>
            <CardDescription>Write your trap logic here</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <EnhancedCodeEditor
              value={code}
              onChange={setCode}
              language="solidity"
              height="500px"
            />
            <div className="p-4 border-t bg-amber-50/50 dark:bg-amber-900/20">
              <p className="text-sm text-muted-foreground">
                💡 Include both collect() and shouldRespond(). Real-time data from Ethereum mainnet.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right Side - Output */}
        <Card className="rounded-2xl border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-4">
            <CardTitle>🎯 Trap Execution Output</CardTitle>
            <CardDescription>
              Results from simulation against live EVM data
              {isStreaming && output?.blockNumber && ` • Block ${output.blockNumber}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {output ? (
              <OutputPanel output={output} />
            ) : (
              <div className="flex items-center justify-center h-[500px] text-center">
                <div className="space-y-3">
                  <div className="text-6xl">🎯</div>
                  <p className="text-lg font-medium text-muted-foreground">Ready to Execute</p>
                  <p className="text-sm text-muted-foreground">
                    Write your trap code and click "Run Trap" or "Start Stream" to see the results
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* CLI-style Stream Log Panel - Split View */}
      <StreamLogPanel results={streamResults} />
    </div>
  );
}
