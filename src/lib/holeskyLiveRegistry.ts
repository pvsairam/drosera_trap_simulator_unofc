// src/lib/holeskyLiveRegistry.ts
import { JsonRpcProvider, Contract } from "ethers";

export interface CadetRecord {
  index: number;
  discordName: string;
  walletAddress: string;
}

export interface PaginatedCadets {
  cadets: CadetRecord[];
  displaytotal: number
  total: number;
  hasMore: boolean;
}

const provider = new JsonRpcProvider("https://ethereum-holesky-rpc.publicnode.com/");
const contractAddress = "0x4608Afa7f277C8E0BE232232265850d1cDeB600E";
const abi = [
  "function getDiscordNamesBatch(uint256 start, uint256 end) view returns (string[])"
];


const registry = new Contract(contractAddress, abi, provider);

export async function fetchCadetsPageLive(page: number, pageSize: number): Promise<PaginatedCadets> {
  try {
    const startIndex = page * pageSize;
    const endIndex = Math.min(startIndex + pageSize, 2000); // capped at 2000 max

    const names: string[] = await registry.getDiscordNamesBatch(startIndex, endIndex);

    const cadets: CadetRecord[] = names
      .map((name, i) => ({
        discordName: name,
        walletAddress: `0x1000...0000`, // placeholder
        index: startIndex + i
      }))
      .filter(record => record.discordName && record.discordName !== "DISCORD_USERNAME");

    return {
      cadets,
      displaytotal: 0,
      total: 2000, // dynamic rather than hardcoded 1200
      hasMore: names.length === pageSize // realistic pagination
    };
  } catch (err) {
    console.error("💥 Failed to fetch cadets from smart contract", err);
    throw new Error("Failed to fetch cadets from smart contract");
  }
}


export function exportCadetsToCSV(cadets: CadetRecord[]): string {
  const header = "Index,Discord Name,Wallet Address";
  const rows = cadets.map(c => `${c.index},${c.discordName},${c.walletAddress}`);
  return [header, ...rows].join("\n");
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
