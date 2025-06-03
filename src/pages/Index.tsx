
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrapSimulatorSplit } from "@/components/TrapSimulatorSplit";
import { StreamingTrapSimulator } from "@/components/StreamingTrapSimulator";
import { EnhancedProofOfTrap } from "@/components/EnhancedProofOfTrap";
// import TestDiscordFetch from "@/components/TestDiscordFetch";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col items-center justify-center text-center mb-8">
  <div className="flex items-center gap-3 mb-2">
    <img
      src="/img-uploads/0914cc16-6251-427f-bb3b-b00fe549f854.png"
      alt="Drosera Logo"
      className="w-12 h-12 object-contain"
    />
    <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent flex items-end gap-2">
      Drosera Trap Simulator
      <span className="text-sm font-normal text-muted-foreground">(unofficial)</span>
    </h1>
  </div>
  <p className="text-muted-foreground text-lg">
    A sleek Remix-style Solidity-only playground to write, test, and simulate Drosera Traps
  </p>
</div>


          {/* Main Content */}
          <Card className="rounded-2xl shadow-2xl border-2 border-amber-200 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="text-2xl bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                Trap Development Environment
              </CardTitle>
              <CardDescription>
                Write, test, and simulate Drosera Traps using live EVM data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="streaming" className="w-full">
                <TabsList className="grid w-full grid-cols-3 rounded-xl bg-amber-100 dark:bg-amber-900/20">
                  <TabsTrigger value="streaming" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
                    🔄 Real-Time Simulator
                  </TabsTrigger>
                  <TabsTrigger value="split-view" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
                    📱 Split View
                  </TabsTrigger>
                  <TabsTrigger value="cadets" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
                    🏆 Proof-of-Trap
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="streaming" className="mt-6">
                  <StreamingTrapSimulator />
                </TabsContent>
                
                <TabsContent value="split-view" className="mt-6">
                  <TrapSimulatorSplit />
                </TabsContent>
                
                <TabsContent value="cadets" className="mt-6">
                  <EnhancedProofOfTrap />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
