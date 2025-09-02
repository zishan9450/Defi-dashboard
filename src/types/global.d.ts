// Global TypeScript declarations for ethereum window object

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on(eventName: 'accountsChanged', handler: (accounts: string[]) => void): void;
      on(eventName: 'chainChanged', handler: (chainId: string) => void): void;
      removeListener(eventName: 'accountsChanged', handler: (accounts: string[]) => void): void;
      removeListener(eventName: 'chainChanged', handler: (chainId: string) => void): void;
    };
  }
}

export {};
