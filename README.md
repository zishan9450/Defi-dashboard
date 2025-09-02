# DeFi Dashboard

A comprehensive DeFi dashboard that displays different categories of pools (investment products) using DeFiLlama APIs. The dashboard features three main categories: Lending, Liquid Staking, and Yield Aggregator, with wallet connection functionality to unlock premium features.

## 🚀 Features

### Module 1: Pools Table/Cards View
- **Dual View Modes**: Switch between card and table views
- **Category Filtering**: Filter pools by Lending, Liquid Staking, and Yield Aggregator
- **Real-time Data**: Fetches live data from DeFiLlama APIs
- **Pool Information**: Displays project, category, symbol, TVL, APY, predictions, and risk scores
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Module 2: Pool Detail View
- **Comprehensive Pool Details**: Complete pool information with all metrics
- **Historical APY Chart**: Interactive line chart showing 12-month APY history
- **Monthly Data Points**: Extracts APY data for the 1st day of each month
- **Token Information**: Displays underlying and reward tokens
- **Protocol Links**: Direct links to view pools on their respective protocols

### Module 3: Wallet Connection & Authentication
- **MetaMask Integration**: Connect your Web3 wallet to unlock Yield Aggregator pools
- **Alternative Login**: Email/password authentication as a fallback option
- **Secure State Management**: Context-based authentication state
- **Locked Content**: Yield Aggregator pools remain locked until authentication

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: React Context API
- **APIs**: DeFiLlama Pools and Historical APY APIs

## 📊 Data Sources

### DeFiLlama APIs
- **Pools API**: `https://yields.llama.fi/pools`
- **Historical APY API**: `https://yields.llama.fi/chart/{pool_id}`

### Target Pools
The dashboard displays specific pools from each category:

#### Lending
- Aave V3 (Ethereum)
- Compound V3 (Ethereum)
- Maple (Ethereum)

#### Liquid Staking
- Lido (Ethereum)
- Binance Staked ETH (Ethereum)
- Stader (Ethereum)

#### Yield Aggregator
- Cian Yield Layer (Ethereum)
- Yearn Finance (Ethereum)
- Beefy (Ethereum)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MetaMask browser extension (for wallet connection)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd defi-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm start
```

## 🎨 UI/UX Features

### Design System
- **Clean & Modern**: Inspired by popular DeFi platforms
- **Color-coded Categories**: Each pool category has distinct colors
- **Responsive Layout**: Optimized for all screen sizes
- **Interactive Elements**: Hover effects and smooth transitions
- **Loading States**: Elegant loading indicators
- **Error Handling**: User-friendly error messages

### Navigation
- **Dashboard Overview**: Main page with all pools
- **Pool Details**: Individual pool pages with charts
- **Category Filtering**: Easy filtering between pool types
- **View Toggle**: Switch between card and table views

## 🔐 Authentication Flow

### Wallet Connection (Recommended)
1. Click "Unlock Yield Aggregator" button
2. Select "Wallet" tab in the dialog
3. Click "Connect MetaMask"
4. Approve connection in MetaMask
5. Yield Aggregator pools are now unlocked

### Email Login (Alternative)
1. Click "Unlock Yield Aggregator" button
2. Select "Login" tab in the dialog
3. Enter email and password
4. Click "Login"
5. Yield Aggregator pools are now unlocked

## 📈 Chart Features

### Historical APY Visualization
- **12-Month Timeline**: Shows APY trends over the past year
- **Monthly Data Points**: Extracts data for the 1st day of each month
- **Interactive Tooltips**: Hover to see exact APY values
- **Responsive Design**: Charts adapt to container size
- **Color-coded Lines**: Green theme for positive APY trends

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file for any environment-specific configurations:

```env
NEXT_PUBLIC_API_BASE_URL=https://yields.llama.fi
```

### Customization
- **Theme Colors**: Modify Tailwind CSS variables in `globals.css`
- **API Endpoints**: Update API URLs in `src/lib/api.ts`
- **Target Pools**: Modify pool IDs in `src/lib/api.ts`

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📝 API Documentation

### Pools API Response
```typescript
interface Pool {
  id: string;
  project: string;
  chain: string;
  category: string;
  symbol: string;
  tvlUsd: number;
  apy: number;
  apyMean30d: number;
  prediction?: number;
  sigma?: number;
  poolMeta?: string;
  underlyingTokens?: string[];
  rewardTokens?: string[];
  url?: string;
}
```

### Historical APY API Response
```typescript
interface HistoricalAPY {
  timestamp: number;
  apy: number;
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions:
- Create an issue in the GitHub repository
- Check the API documentation at [DeFiLlama API Docs](https://api-docs.defillama.com/)

## 🔮 Future Enhancements

- [ ] Real-time price updates
- [ ] Portfolio tracking
- [ ] Advanced filtering options
- [ ] Export functionality
- [ ] Dark mode support
- [ ] Mobile app version
- [ ] Additional blockchain networks
- [ ] Social features and sharing
