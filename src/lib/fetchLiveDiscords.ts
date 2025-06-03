import { JsonRpcProvider, Contract } from "ethers";
import { CadetRecord } from "./discordRegistry";

export async function fetchLiveDiscordCadets(): Promise<CadetRecord[]> {
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
    const filtered = result.filter(name => name && name !== "DISCORD_USERNAME");

    const cadets: CadetRecord[] = filtered.map(name => ({
      discordName: name,
      walletAddress: `0x${Buffer.from(name).toString("hex").slice(0, 40).padEnd(40, "0")}`
    }));

    return cadets;
  } catch (err) {
    console.error("🚨 Failed to fetch Discord names:", err);
    throw new Error("Holesky contract call failed");
  }
}
