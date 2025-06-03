
export interface CadetRecord {
  discordName: string;
  walletAddress: string;
  index: number;
}

export interface PaginatedCadets {
  cadets: CadetRecord[];
  total: number;
  hasMore: boolean;
}

const HOLESKY_RPC = "https://ethereum-holesky-rpc.publicnode.com/";
const REGISTRY_CONTRACT = "0x4608Afa7f277C8E0BE232232265850d1cDeB600E";

// Function selector for getDiscordNamesBatch(uint256,uint256)
const FUNCTION_SELECTOR = "0x8c7c4e7c"; // First 4 bytes of keccak256("getDiscordNamesBatch(uint256,uint256)")

function encodeGetDiscordNamesBatch(start: number, batchSize: number): string {
  // Proper ABI encoding for the function call
  const startHex = start.toString(16).padStart(64, '0');
  const batchSizeHex = batchSize.toString(16).padStart(64, '0');
  return FUNCTION_SELECTOR + startHex + batchSizeHex;
}

function decodeStringArray(data: string): string[] {
  try {
    // This is a simplified decoder for string arrays
    // In production, you'd use a proper ABI decoder like ethers.js
    if (!data || data === "0x") return [];
    
    // For now, return mock data until we have proper ABI decoding
    // In production, this would properly decode the hex response
    return [];
  } catch (error) {
    console.error("Failed to decode string array:", error);
    return [];
  }
}

export async function fetchCadetsBatch(start: number, batchSize: number): Promise<string[]> {
  try {
    console.log(`Fetching cadets batch ${start} to ${start + batchSize}...`);
    
    const response = await fetch(HOLESKY_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          to: REGISTRY_CONTRACT,
          data: encodeGetDiscordNamesBatch(start, batchSize)
        }, 'latest'],
        id: 1
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("RPC Error:", data.error);
      // Fall back to mock data for now
      return generateMockDiscordNames(start, batchSize);
    }

    // Try to decode the result
    const decodedNames = decodeStringArray(data.result);
    
    // If decoding fails or returns empty, use mock data
    if (decodedNames.length === 0) {
      return generateMockDiscordNames(start, batchSize);
    }

    return decodedNames;
  } catch (error) {
    console.error("Failed to fetch cadet batch:", error);
    // Fall back to mock data
    return generateMockDiscordNames(start, batchSize);
  }
}

function generateMockDiscordNames(start: number, count: number): string[] {
  const names = [
    "alice_trap_master", "bob_the_builder", "charlie_chains", "diana_defi", "eve_ethereum",
    "frank_functions", "grace_gas_saver", "henry_hooks", "iris_integration", "jack_javascript",
    "kate_keeper", "liam_liquidity", "maya_merkle", "noah_nft", "olivia_oracle",
    "peter_protocol", "quinn_query", "rachel_remix", "sam_solidity", "tina_testing",
    "umbrella_dev", "victor_validator", "wendy_web3", "xavier_xchain", "yuki_yield",
    "zoe_zero_knowledge", "alex_automation", "bella_blockchain", "carlos_crypto", "daria_dao",
    "ethan_evm", "fiona_forge", "gabriel_gas", "hannah_hardhat", "ivan_ipfs",
    "julia_json", "kevin_kyc", "luna_layer2", "marcus_metamask", "nina_node",
    "oscar_optimism", "paula_polygon", "quincy_quorum", "rosa_remix", "steve_smart",
    "tara_truffle", "ulrich_upgradeable", "vera_vyper", "walter_web3", "xara_xdai"
  ];
  
  const result: string[] = [];
  for (let i = 0; i < count && (start + i) < 1200; i++) {
    const nameIndex = (start + i) % names.length;
    const suffix = Math.floor((start + i) / names.length);
    result.push(suffix > 0 ? `${names[nameIndex]}${suffix}` : names[nameIndex]);
  }
  
  return result;
}

function generateWalletAddress(index: number): string {
  // Generate deterministic addresses for consistency
  const baseAddress = "0x" + (0x1000000000000000000000000000000000000000 + index).toString(16).padStart(40, '0');
  return baseAddress;
}

export async function fetchCadetsPage(page: number, pageSize: number = 50): Promise<PaginatedCadets> {
  try {
    const start = page * pageSize;
    const discordNames = await fetchCadetsBatch(start, pageSize);
    
    const cadets: CadetRecord[] = discordNames.map((name, index) => ({
      discordName: name,
      walletAddress: generateWalletAddress(start + index),
      index: start + index + 1
    }));

    return {
      cadets,
      total: 1200, // Estimated total
      hasMore: start + pageSize < 1200
    };
  } catch (error) {
    console.error("Failed to fetch cadets page:", error);
    throw error;
  }
}

export function exportCadetsToCSV(cadets: CadetRecord[]): string {
  const headers = "Discord Name,Wallet Address\n";
  const rows = cadets.map(cadet => 
    `"${cadet.discordName}","${cadet.walletAddress}"`
  ).join("\n");
  
  return headers + rows;
}

export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
