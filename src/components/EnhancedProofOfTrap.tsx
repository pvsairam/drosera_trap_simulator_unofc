
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  fetchCadetsPageLive as fetchCadetsPage,
  exportCadetsToCSV,
  downloadCSV,
  CadetRecord,
  PaginatedCadets
} from "@/lib/holeskyLiveRegistry";
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search, RefreshCw, Copy, Wallet, Download, Users } from "lucide-react";

export function EnhancedProofOfTrap() {
  const [paginatedData, setPaginatedData] = useState<PaginatedCadets>({ cadets: [], total: 0, hasMore: false, displaytotal: 0 });
  const [filteredCadets, setFilteredCadets] = useState<CadetRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  const pageSize = 50;

  const loadCadetsPage = async (page: number = currentPage) => {
    setIsLoading(true);
    try {
      const data = await fetchCadetsPage(page, pageSize);
      setPaginatedData(data);
      setFilteredCadets(data.cadets);
      setLastUpdated(new Date());
      setCurrentPage(page);
      
      toast({
        title: "✅ Registry Updated",
        description: `Loaded page ${page + 1} • ${data.cadets.length} cadets`,
      });
    } catch (error) {
      console.error("Failed to fetch cadets page:", error);
      toast({
        title: "❌ Fetch Failed",
        description: "Could not load cadet registry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportAll = async () => {
  setIsExporting(true);
  try {
    const allCadets: CadetRecord[] = [];
    let page = 0;

    while (true) {
      const pageData = await fetchCadetsPage(page, pageSize);
      if (pageData.cadets.length === 0) break; // End when no more cadets
      allCadets.push(...pageData.cadets);
      page++;
    }

    const csvContent = exportCadetsToCSV(allCadets);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadCSV(csvContent, `drosera-cadets-${timestamp}.csv`);

    toast({
      title: "📁 Export Complete",
      description: `Exported ${allCadets.length} cadets to CSV`,
    });
  } catch (error) {
    toast({
      title: "❌ Export Failed",
      description: "Could not export cadet data",
      variant: "destructive",
    });
  } finally {
    setIsExporting(false);
  }
};


  useEffect(() => {
    loadCadetsPage(0);
    
    // Auto-refresh every 2 minutes
    const interval = setInterval(() => loadCadetsPage(), 120000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const filtered = paginatedData.cadets.filter(cadet =>
      cadet.discordName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cadet.walletAddress.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCadets(filtered);
  }, [searchTerm, paginatedData.cadets]);

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

  const totalPages = Math.ceil(paginatedData.total / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="rounded-2xl border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                🏆 Verified Cadets Registry
              </CardTitle>
              <CardDescription>
                Live data from Holesky blockchain registry contract
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
                onClick={() => loadCadetsPage()}
                disabled={isLoading}
                className="rounded-full border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Discord username or wallet address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl border-amber-300 dark:border-amber-700 focus:border-amber-500 dark:focus:border-amber-500"
              />
            </div>
            <Button
              onClick={handleExportAll}
              //disabled={isExporting || paginatedData.total === 0}
              disabled={true}
              variant="outline"
              className="rounded-xl border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900"
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? "Exporting..." : "Export CSV"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-xl border-amber-200 dark:border-amber-800">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-2xl font-bold text-amber-600">{paginatedData.displaytotal}</p>
                <p className="text-sm text-muted-foreground">Total Cadets</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-amber-200 dark:border-amber-800">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500">
                <span className="text-lg font-bold">{currentPage + 1}</span>
              </Badge>
              <div>
                <p className="text-sm text-muted-foreground">of {totalPages} pages</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-amber-200 dark:border-amber-800">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-2xl font-bold text-amber-600">{filteredCadets.length}</p>
                <p className="text-sm text-muted-foreground">Filtered Results</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <Card className="rounded-2xl border-amber-200 dark:border-amber-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              📋 Cadet List ({filteredCadets.length} {filteredCadets.length === 1 ? 'cadet' : 'cadets'})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-6 w-6 animate-spin text-amber-500" />
                <span className="text-lg">Loading cadets...</span>
              </div>
            </div>
          ) : filteredCadets.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-muted-foreground text-lg">
                {paginatedData.cadets.length === 0 
                  ? "No cadets found on this page." 
                  : "No cadets match your search."}
              </p>
              {searchTerm && (
                <Button
                  variant="ghost"
                  onClick={() => setSearchTerm("")}
                  className="text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900"
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4">
                {filteredCadets.map((cadet) => (
                  <div
                    key={`${cadet.discordName}-${cadet.index}`}
                    className="group p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Badge
                          variant="secondary"
                          className="rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300"
                        >
                          #{cadet.index}
                        </Badge>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className="rounded-full bg-gradient-to-r from-amber-600 to-orange-600 text-white px-3 py-1 text-sm">
                              @{cadet.discordName}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Wallet className="h-3 w-3" />
                            <code className="text-xs bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
                              {truncateAddress(cadet.walletAddress)}
                            </code>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full h-8 w-8 hover:bg-amber-100 dark:hover:bg-amber-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(cadet.discordName, "Discord name");
                          }}
                          title="Copy Discord name"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full h-8 w-8 hover:bg-amber-100 dark:hover:bg-amber-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(cadet.walletAddress, "wallet address");
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

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination className="mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => currentPage > 0 && loadCadetsPage(currentPage - 1)}
                        className={currentPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => loadCadetsPage(pageNum)}
                            isActive={pageNum === currentPage}
                            className="cursor-pointer"
                          >
                            {pageNum + 1}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => currentPage < totalPages - 1 && loadCadetsPage(currentPage + 1)}
                        className={currentPage >= totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
