import { JsonRpcProvider, Contract } from "ethers";

export interface CadetRecord {
  discordName: string;
  walletAddress: string;
}

export async function fetchCadetRecords(): Promise<CadetRecord[]> {
  const provider = new JsonRpcProvider("https://ethereum-holesky-rpc.publicnode.com/");
  const abi = [
    "function getDiscordNamesBatch(uint256 start, uint256 end) view returns (string[])"
  ];
  const contract = new Contract(
    "0x4608Afa7f277C8E0BE232232265850d1cDeB600E",
    abi,
    provider
  );

  try {
    const result = await contract.getDiscordNamesBatch(0, 2000);
    const cleaned = result.filter(name => name && name !== "DISCORD_USERNAME");

    return cleaned.map(name => ({
      discordName: name,
      // Dummy deterministic wallet address (optional: replace with real if needed)
      walletAddress: `0x${Buffer.from(name).toString("hex").slice(0, 40).padEnd(40, "0")}`
    }));
  } catch (err) {
    console.error("🚨 Failed to fetch cadets:", err);
    throw new Error("Contract call failed");
  }
}

export async function fetchDiscordNames(): Promise<string[]> {
  const records = await fetchCadetRecords();
  return records.map(record => record.discordName);
}
