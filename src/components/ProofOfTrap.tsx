
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { fetchCadetRecords, CadetRecord } from "@/lib/discordRegistry";
import { Search, RefreshCw, Copy, Wallet } from "lucide-react";

export function ProofOfTrap() {
  const [cadetRecords, setCadetRecords] = useState<CadetRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<CadetRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  const loadCadetRecords = async () => {
    setIsLoading(true);
    try {
      const records = await fetchCadetRecords();
      setCadetRecords(records);
      setFilteredRecords(records);
      setLastUpdated(new Date());
      
      toast({
        title: "✅ Registry Updated",
        description: `Found ${records.length} verified cadets`,
      });
    } catch (error) {
      console.error("Failed to fetch cadet records:", error);
      toast({
        title: "❌ Fetch Failed",
        description: "Could not load cadet registry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCadetRecords();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(loadCadetRecords, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const filtered = cadetRecords.filter(record =>
      record.discordName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.walletAddress.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecords(filtered);
  }, [searchTerm, cadetRecords]);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "📋 Copied",
        description: `Copied ${type} to clipboard`,
      });
    } catch (error) {
      toast({
        title: "❌ Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="rounded-2xl border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                🏆 Verified Cadets Registry
              </CardTitle>
              <CardDescription>
                Fetched live from Holesky registry smart contract
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {lastUpdated && (
                <span className="text-xs text-muted-foreground">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={loadCadetRecords}
                disabled={isLoading}
                className="rounded-full border-orange-300 hover:bg-orange-100 dark:border-orange-700 dark:hover:bg-orange-900"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Discord username or wallet address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl border-orange-300 dark:border-orange-700 focus:border-orange-500 dark:focus:border-orange-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="rounded-2xl border-orange-200 dark:border-orange-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              📋 Cadet List ({filteredRecords.length} {filteredRecords.length === 1 ? 'cadet' : 'cadets'})
            </CardTitle>
            {cadetRecords.length > 0 && (
              <Badge variant="outline" className="rounded-full bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-700">
                Total: {cadetRecords.length} registered
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-6 w-6 animate-spin text-orange-500" />
                <span className="text-lg">Loading cadets...</span>
              </div>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-muted-foreground text-lg">
                {cadetRecords.length === 0 
                  ? "No cadets registered yet. Check back soon." 
                  : "No cadets match your search."}
              </p>
              {searchTerm && (
                <Button
                  variant="ghost"
                  onClick={() => setSearchTerm("")}
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900"
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredRecords.map((record, index) => (
                <div
                  key={`${record.discordName}-${index}`}
                  className="group p-4 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge
                        variant="secondary"
                        className="rounded-full bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300"
                      >
                        #{index + 1}
                      </Badge>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className="rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 text-sm">
                            @{record.discordName}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Wallet className="h-3 w-3" />
                          <code className="text-xs bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
                            {truncateAddress(record.walletAddress)}
                          </code>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full h-8 w-8 hover:bg-orange-100 dark:hover:bg-orange-900"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(record.discordName, "Discord name");
                        }}
                        title="Copy Discord name"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full h-8 w-8 hover:bg-orange-100 dark:hover:bg-orange-900"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(record.walletAddress, "wallet address");
                        }}
                        title="Copy wallet address"
                      >
                        <Wallet className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
