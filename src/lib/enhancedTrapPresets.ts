
export const ENHANCED_TRAP_PRESETS = {
  example: {
    name: "Example Template",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

function collect() view returns (uint256) {
    return block.number;
}

function shouldRespond(uint256[] memory pastCollected) pure returns (bool) {
    if (pastCollected.length < 2) return false;
    return pastCollected[pastCollected.length - 1] % 2 == 0;
}`
  },
  
  oracleAnalysis: {
    name: "Oracle Price Data Analysis",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPriceFeed {
    function latestRoundData() external view returns (uint256);
}

function collect() view returns (uint256) {
    IPriceFeed feed = IPriceFeed(0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419); // ETH/USD
    return feed.latestRoundData();
}

function shouldRespond(uint256[] memory pastCollected) pure returns (bool) {
    if (pastCollected.length < 5) return false;
    
    // Detect price manipulation: >5% change in last block
    uint256 current = pastCollected[pastCollected.length - 1];
    uint256 previous = pastCollected[pastCollected.length - 2];
    
    if (previous == 0) return false;
    uint256 changePercent = current > previous ? 
        ((current - previous) * 100) / previous :
        ((previous - current) * 100) / previous;
    
    return changePercent > 5; // 5% threshold
}`
  },

  avsSlashing: {
    name: "AVS Slashing Detection",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAVSDirectory {
    function operatorShares(address operator, address strategy) external view returns (uint256);
}

function collect() view returns (uint256) {
    IAVSDirectory avs = IAVSDirectory(0x0000000000000000000000000000000000000000);
    address operator = 0x1234567890123456789012345678901234567890;
    address strategy = 0x0987654321098765432109876543210987654321;
    return avs.operatorShares(operator, strategy);
}

function shouldRespond(uint256[] memory pastCollected) pure returns (bool) {
    if (pastCollected.length < 2) return false;
    
    uint256 current = pastCollected[pastCollected.length - 1];
    uint256 previous = pastCollected[pastCollected.length - 2];
    
    // Detect slashing: shares decreased
    return current < previous && previous > 0;
}`
  },

  restakingAnalysis: {
    name: "Restaking Economic Analysis",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IEigenLayer {
    function stakerStrategyShares(address staker, address strategy) external view returns (uint256);
}

function collect() view returns (uint256) {
    IEigenLayer eigen = IEigenLayer(0x0000000000000000000000000000000000000000);
    address staker = 0x1234567890123456789012345678901234567890;
    address strategy = 0x0987654321098765432109876543210987654321;
    return eigen.stakerStrategyShares(staker, strategy);
}

function shouldRespond(uint256[] memory pastCollected) pure returns (bool) {
    if (pastCollected.length < 3) return false;
    
    // Detect large restaking movements
    uint256 current = pastCollected[pastCollected.length - 1];
    uint256 prev1 = pastCollected[pastCollected.length - 2];
    uint256 prev2 = pastCollected[pastCollected.length - 3];
    
    // Look for significant change pattern
    uint256 change1 = current > prev1 ? current - prev1 : prev1 - current;
    uint256 change2 = prev1 > prev2 ? prev1 - prev2 : prev2 - prev1;
    
    return change1 > 1e18 || change2 > 1e18; // 1 ETH threshold
}`
  },

  bridgeMonitoring: {
    name: "Bridge Monitoring",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
}

function collect() view returns (uint256) {
    // Monitor bridge contract balance
    IERC20 token = IERC20(0xA0b86a33E6441a8c8d6Ca9E48c7C3e83C0c6Baf5); // USDC
    address bridge = 0x1234567890123456789012345678901234567890;
    return token.balanceOf(bridge);
}

function shouldRespond(uint256[] memory pastCollected) pure returns (bool) {
    if (pastCollected.length < 2) return false;
    
    uint256 current = pastCollected[pastCollected.length - 1];
    uint256 previous = pastCollected[pastCollected.length - 2];
    
    // Alert on large deposits/withdrawals (>100k USDC)
    uint256 threshold = 100000 * 1e6; // 100k USDC
    uint256 change = current > previous ? current - previous : previous - current;
    
    return change > threshold;
}`
  },

  dexLiquidity: {
    name: "DEX Liquidity Analysis",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IUniswapV2Pair {
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
}

function collect() view returns (uint256) {
    IUniswapV2Pair pair = IUniswapV2Pair(0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc); // USDC/ETH
    (uint112 reserve0, uint112 reserve1,) = pair.getReserves();
    return uint256(reserve0) + uint256(reserve1); // Total liquidity
}

function shouldRespond(uint256[] memory pastCollected) pure returns (bool) {
    if (pastCollected.length < 4) return false;
    
    // Detect liquidity drain pattern
    uint256 current = pastCollected[pastCollected.length - 1];
    uint256 prev1 = pastCollected[pastCollected.length - 2];
    uint256 prev2 = pastCollected[pastCollected.length - 3];
    uint256 prev3 = pastCollected[pastCollected.length - 4];
    
    // Check for consistent decrease
    return current < prev1 && prev1 < prev2 && prev2 < prev3;
}`
  },

  timeSeriesAnalysis: {
    name: "Time Series Pattern Detection",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

function collect() view returns (uint256) {
    // Collect gas price for pattern analysis
    return tx.gasprice;
}

function shouldRespond(uint256[] memory pastCollected) pure returns (bool) {
    if (pastCollected.length < 5) return false;
    
    // Simple moving average analysis
    uint256 sum = 0;
    for (uint i = 0; i < pastCollected.length; i++) {
        sum += pastCollected[i];
    }
    uint256 average = sum / pastCollected.length;
    uint256 current = pastCollected[pastCollected.length - 1];
    
    // Alert if current value is 50% above average
    return current > (average * 150) / 100;
}`
  },

  aggregatedDexData: {
    name: "Aggregated DEX Data Analysis",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function totalSupply() external view returns (uint256);
}

function collect() view returns (uint256) {
    // Monitor popular DEX token supplies
    IERC20 uni = IERC20(0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984); // UNI
    return uni.totalSupply();
}

function shouldRespond(uint256[] memory pastCollected) pure returns (bool) {
    if (pastCollected.length < 3) return false;
    
    // Check for supply changes (minting/burning events)
    uint256 current = pastCollected[pastCollected.length - 1];
    uint256 previous = pastCollected[pastCollected.length - 2];
    
    return current != previous; // Any supply change
}`
  },

  lendingProtocolMonitor: {
    name: "Lending Protocol Monitor",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICompound {
    function totalBorrows() external view returns (uint256);
    function totalSupply() external view returns (uint256);
}

function collect() view returns (uint256) {
    ICompound cToken = ICompound(0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643); // cDAI
    uint256 borrows = cToken.totalBorrows();
    uint256 supply = cToken.totalSupply();
    
    // Return utilization ratio (borrows/supply * 100)
    return supply > 0 ? (borrows * 100) / supply : 0;
}

function shouldRespond(uint256[] memory pastCollected) pure returns (bool) {
    if (pastCollected.length < 2) return false;
    
    uint256 current = pastCollected[pastCollected.length - 1];
    uint256 previous = pastCollected[pastCollected.length - 2];
    
    // Alert if utilization spikes above 90% or drops below 10%
    return (current > 90 && previous <= 90) || (current < 10 && previous >= 10);
}`
  }
};
