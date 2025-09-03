// WalletConnect Configuration
export const WALLET_CONNECT_CONFIG = {
  // You need to get a project ID from https://cloud.walletconnect.com/
  // For now, using a placeholder - replace with your actual project ID
  projectId: '2dac15a583607e821337cd794e7b2656',
  
  // Supported chains
  chains: ['eip155:1'], // Ethereum mainnet
  
  // RPC endpoints
  rpc: {
    1: 'https://ethereum.publicnode.com', // Ethereum mainnet
  },
  
  // Modal configuration
  modal: {
    themeMode: 'dark' as const,
    themeVariables: {
      '--wcm-z-index': '9999',
    },
  },
};

// Instructions for getting a project ID:
// 1. Go to https://cloud.walletconnect.com/
// 2. Sign up/Login
// 3. Create a new project
// 4. Copy the project ID
// 5. Replace 'YOUR_PROJECT_ID_HERE' with your actual project ID
