import { useEffect, useState } from "react";
import { JsonRpcProvider, Contract } from "ethers";

export default function TestDiscordFetch() {
  const [discords, setDiscords] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiscords = async () => {
      try {
        const provider = new JsonRpcProvider("https://ethereum-holesky-rpc.publicnode.com/");
        const abi = [
          "function getDiscordNamesBatch(uint256 start, uint256 end) view returns (string[])"
        ];
        const contract = new Contract(
          "0x4608Afa7f277C8E0BE232232265850d1cDeB600E",
          abi,
          provider
        );

        const result = await contract.getDiscordNamesBatch(0, 2000);
        setDiscords(result.filter((d: string) => d && d !== "DISCORD_USERNAME"));
      } catch (err: any) {
        setError(err.message || "unknown error");
      }
    };

    fetchDiscords();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl mb-4 font-bold">🎯 Test Discord Fetch</h2>
      {error && <p className="text-red-500">❌ {error}</p>}
      <ul className="list-disc pl-5">
        {discords.map((name, i) => (
          <li key={i}>{name}</li>
        ))}
      </ul>
    </div>
  );
}
