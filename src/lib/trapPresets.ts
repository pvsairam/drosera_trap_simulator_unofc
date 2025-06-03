
export const TRAP_PRESETS = {
  example: {
    name: "Example Template",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

function collect() view returns (uint256) {
    return block.number;
}

function shouldRespond(uint256[] memory pastCollected) pure returns (bool) {
    return pastCollected[pastCollected.length - 1] % 2 == 0;
}`
  },
  
  ethTransfer: {
    name: "ETH Transfer Trap",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

function collect() view returns (uint256) {
    return address(this).balance;
}

function shouldRespond(uint256[] memory pastCollected) pure returns (bool) {
    if (pastCollected.length < 2) return false;
    
    uint256 current = pastCollected[pastCollected.length - 1];
    uint256 previous = pastCollected[pastCollected.length - 2];
    
    // Trigger if balance increased by more than 1 ETH
    return current > previous + 1e18;
}`
  },
  
  nftMint: {
    name: "NFT Mint Detector",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC721 {
    function totalSupply() external view returns (uint256);
}

function collect() view returns (uint256) {
    // Example NFT contract address (replace with actual)
    IERC721 nft = IERC721(0x0000000000000000000000000000000000000000);
    return nft.totalSupply();
}

function shouldRespond(uint256[] memory pastCollected) pure returns (bool) {
    if (pastCollected.length < 2) return false;
    
    uint256 current = pastCollected[pastCollected.length - 1];
    uint256 previous = pastCollected[pastCollected.length - 2];
    
    // Trigger if new NFTs were minted
    return current > previous;
}`
  },
  
  stablecoinSpike: {
    name: "Stablecoin Spike Detector",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPriceFeed {
    function latestRoundData() external view returns (uint256);
}

function collect() view returns (uint256) {
    // Example price feed (replace with actual)
    IPriceFeed feed = IPriceFeed(0x0000000000000000000000000000000000000000);
    return feed.latestRoundData();
}

function shouldRespond(uint256[] memory pastCollected) pure returns (bool) {
    if (pastCollected.length < 2) return false;
    
    uint256 current = pastCollected[pastCollected.length - 1];
    uint256 previous = pastCollected[pastCollected.length - 2];
    
    // Trigger if price deviates more than 2% from $1
    uint256 deviation = current > 1e8 ? current - 1e8 : 1e8 - current;
    return deviation > 2e6; // 2% of 1e8
}`
  },
  
  priceManipulation: {
    name: "Price Feed Manipulation Alert",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

function collect() view returns (uint256) {
    // Simulate price data collection
    return block.timestamp % 1000000; // Mock price
}

function shouldRespond(uint256[] memory pastCollected) pure returns (bool) {
    if (pastCollected.length < 5) return false;
    
    // Check for suspicious price movements
    uint256 maxPrice = 0;
    uint256 minPrice = type(uint256).max;
    
    for (uint i = 0; i < pastCollected.length; i++) {
        if (pastCollected[i] > maxPrice) maxPrice = pastCollected[i];
        if (pastCollected[i] < minPrice) minPrice = pastCollected[i];
    }
    
    // Trigger if price swing is more than 10%
    if (minPrice == 0) return false;
    return ((maxPrice - minPrice) * 100 / minPrice) > 10;
}`
  },
  
  customEvent: {
    name: "Custom Contract Event Trap",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ITarget {
    function someValue() external view returns (uint256);
}

function collect() view returns (uint256) {
    // Monitor a specific contract's state
    ITarget target = ITarget(0x0000000000000000000000000000000000000000);
    return target.someValue();
}

function shouldRespond(uint256[] memory pastCollected) pure returns (bool) {
    if (pastCollected.length < 2) return false;
    
    uint256 current = pastCollected[pastCollected.length - 1];
    uint256 previous = pastCollected[pastCollected.length - 2];
    
    // Trigger on any state change
    return current != previous;
}`
  },
  
  ensActivity: {
    name: "ENS Activity Trap",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IENS {
    function recordVersions(bytes32 node) external view returns (uint64);
}

function collect() view returns (uint256) {
    // Monitor ENS record changes
    IENS ens = IENS(0x0000000000000000000000000000000000000000);
    bytes32 node = keccak256("example.eth");
    return uint256(ens.recordVersions(node));
}

function shouldRespond(uint256[] memory pastCollected) pure returns (bool) {
    if (pastCollected.length < 2) return false;
    
    uint256 current = pastCollected[pastCollected.length - 1];
    uint256 previous = pastCollected[pastCollected.length - 2];
    
    // Trigger if ENS record was updated
    return current > previous;
}`
  }
};
