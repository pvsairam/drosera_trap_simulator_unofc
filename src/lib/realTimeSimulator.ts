
export interface TrapResult {
  success: boolean;
  shouldRespond?: boolean;
  collectData?: any;
  rawBytes?: string;
  blockNumber?: number;
  error?: string;
  details?: string;
  timestamp?: number;
}

export interface StreamState {
  isStreaming: boolean;
  blockCount: number;
  results: TrapResult[];
}

const MAINNET_RPC = "https://mainnet.infura.io/v3/015ce770e4f24900b2ad8c0e8aa975a0";

export class RealTimeTrapSimulator {
  private streamInterval: NodeJS.Timeout | null = null;
  private callbacks: ((result: TrapResult) => void)[] = [];
  private pastCollectedData: any[] = [];
  private maxHistorySize = 5;

  async getCurrentBlock(): Promise<number> {
    try {
      const response = await fetch(MAINNET_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1
        })
      });
      const data = await response.json();
      return parseInt(data.result, 16);
    } catch (error) {
      console.error("Failed to fetch current block:", error);
      throw error;
    }
  }

  async getBlockData(blockNumber: number): Promise<any> {
    try {
      const response = await fetch(MAINNET_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBlockByNumber',
          params: [`0x${blockNumber.toString(16)}`, false],
          id: 1
        })
      });
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error("Failed to fetch block data:", error);
      throw error;
    }
  }

  async simulateTrap(code: string): Promise<TrapResult> {
    try {
      console.log("Simulating trap with real-time data...");
      
      // Validate code contains required functions
      if (!code.includes("function collect()")) {
        throw new Error("Missing collect() function");
      }
      
      if (!code.includes("function shouldRespond(")) {
        throw new Error("Missing shouldRespond() function");
      }

      const currentBlock = await this.getCurrentBlock();
      const blockData = await this.getBlockData(currentBlock);
      
      // Simulate collect() execution with real block data
      const collectResult = {
        blockNumber: currentBlock,
        timestamp: parseInt(blockData.timestamp, 16),
        gasLimit: parseInt(blockData.gasLimit, 16),
        gasUsed: parseInt(blockData.gasUsed, 16),
        difficulty: blockData.difficulty,
        hash: blockData.hash
      };

      // Add to history for shouldRespond()
      this.pastCollectedData.push(collectResult);
      if (this.pastCollectedData.length > this.maxHistorySize) {
        this.pastCollectedData.shift();
      }

      // Simulate shouldRespond() with historical data
      const shouldRespond = this.evaluateShouldRespond(code, this.pastCollectedData);
      
      return {
        success: true,
        shouldRespond,
        collectData: collectResult,
        rawBytes: blockData.hash,
        blockNumber: currentBlock,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error("Real-time simulation error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown simulation error",
        details: "Failed to execute real-time trap simulation"
      };
    }
  }

  private evaluateShouldRespond(code: string, pastData: any[]): boolean {
    // Simple heuristic evaluation based on code patterns
    if (code.includes("block.number % 2 == 0")) {
      return pastData[pastData.length - 1]?.blockNumber % 2 === 0;
    }
    if (code.includes("gasUsed")) {
      return pastData.length >= 2 && 
        pastData[pastData.length - 1]?.gasUsed > pastData[pastData.length - 2]?.gasUsed;
    }
    if (code.includes("timestamp")) {
      return pastData.length >= 2;
    }
    // Default random response for complex logic
    return Math.random() > 0.6;
  }

  startStream(code: string, onResult: (result: TrapResult) => void): void {
    if (this.streamInterval) {
      this.stopStream();
    }

    this.callbacks.push(onResult);
    
    this.streamInterval = setInterval(async () => {
      try {
        const result = await this.simulateTrap(code);
        this.callbacks.forEach(callback => callback(result));
      } catch (error) {
        console.error("Stream error:", error);
      }
    }, 15000); // Every 15 seconds (roughly block time)
    
    console.log("Started real-time trap stream");
  }

  stopStream(): void {
    if (this.streamInterval) {
      clearInterval(this.streamInterval);
      this.streamInterval = null;
      this.callbacks = [];
      console.log("Stopped real-time trap stream");
    }
  }

  isStreaming(): boolean {
    return this.streamInterval !== null;
  }
}

export const trapSimulator = new RealTimeTrapSimulator();
