# StockSync - Inventory Management Dashboard

<p align="center">
  <img src="public/images/stocksync-logo.png" alt="StockSync Logo" width="200" />
</p>

<p align="center">
  A modern, full-featured inventory management system built with Next.js and Supabase
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#demo">Live Demo</a> •
  <a href="#installation">Installation</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

---

## Features

StockSync provides a comprehensive solution for inventory management:

- **📊 Real-time Dashboard** - Get instant visibility into your inventory metrics
- **📦 Product Management** - Track products, categories, and stock levels
- **🔍 Barcode Scanning** - Quickly lookup and update inventory with barcode scanning
- **📋 Order Management** - Create and track purchase and sales orders
- **👥 Supplier Management** - Maintain supplier information and performance metrics
- **📈 Advanced Analytics** - Gain insights with customizable reports and visualizations
- **📱 Responsive Design** - Access your inventory from any device
- **🔒 Secure Authentication** - Role-based access control with Supabase Auth
- **📤 Export Functionality** - Export data to CSV and Excel formats
- **🔔 Notifications** - Stay informed with low stock alerts and activity updates

## Demo

Experience StockSync in action:

🔗 [Live Demo](https://stocksync-demo.vercel.app)

**Demo Credentials:**
- Email: `demo@stocksync.com`
- Password: `demo123`

## Screenshots

<p align="center">
  <img src="public/images/dashboard-screenshot.png" alt="Dashboard" width="45%" />
  <img src="public/images/inventory-screenshot.png" alt="Inventory Management" width="45%" />
</p>

<p align="center">
  <img src="public/images/analytics-screenshot.png" alt="Analytics" width="45%" />
  <img src="public/images/orders-screenshot.png" alt="Order Management" width="45%" />
</p>

## Installation

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Supabase account

### Setup Instructions

1. **Clone the repository**

\`\`\`bash
git clone https://github.com/yourusername/stocksync.git
cd stocksync
\`\`\`

2. **Install dependencies**

\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. **Set up environment variables**

Create a `.env.local` file in the root directory with the following variables:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
\`\`\`

4. **Set up the database**

Follow the instructions in [supabase-integration.md](./supabase-integration.md) to set up your Supabase database with the required schema.

5. **Run the development server**

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

6. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## Production Deployment

### Deploy on Vercel

The easiest way to deploy StockSync is to use [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fstocksync)

### Environment Variables

Make sure to add the following environment variables to your Vercel project:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Tech Stack

StockSync is built with modern technologies:

- **Frontend**:
  - [Next.js](https://nextjs.org/) - React framework with App Router
  - [React](https://reactjs.org/) - UI library
  - [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
  - [shadcn/ui](https://ui.shadcn.com/) - Reusable component library
  - [Recharts](https://recharts.org/) - Charting library
  - [Framer Motion](https://www.framer.com/motion/) - Animation library

- **Backend**:
  - [Supabase](https://supabase.com/) - Open source Firebase alternative
  - [PostgreSQL](https://www.postgresql.org/) - Relational database
  - [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction) - Serverless functions

- **Authentication**:
  - [Supabase Auth](https://supabase.com/auth) - Authentication and authorization

- **Deployment**:
  - [Vercel](https://vercel.com/) - Deployment platform

## Documentation

Comprehensive documentation is available in the `/docs` directory:

- [User Guide](./docs/user-guide.md) - How to use StockSync
- [API Documentation](./docs/api-docs.md) - API endpoints and usage
- [Database Schema](./docs/database-schema.md) - Database structure and relationships
- [Supabase Integration](./supabase-integration.md) - Setting up Supabase
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute to the project

## Project Structure

\`\`\`
stocksync/
├── app/                  # Next.js App Router
│   ├── api/              # API routes
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Dashboard pages
│   └── landing/          # Landing pages
├── components/           # React components
│   ├── analytics/        # Analytics components
│   ├── dashboard/        # Dashboard components
│   ├── inventory/        # Inventory components
│   ├── landing/          # Landing page components
│   ├── layout/           # Layout components
│   ├── orders/           # Order management components
│   ├── reports/          # Reporting components
│   ├── settings/         # Settings components
│   ├── suppliers/        # Supplier management components
│   └── ui/               # UI components (shadcn/ui)
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and shared code
├── public/               # Static assets
├── utils/                # Helper utilities
│   └── supabase/         # Supabase client utilities
└── database/             # Database scripts and migrations
    └── schema.sql        # Database schema
\`\`\`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Supabase](https://supabase.com/) for the amazing backend platform
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Vercel](https://vercel.com/) for the hosting platform
- All the open-source libraries that made this project possible

---

<p align="center">
  Made with ❤️ by Your Name
</p>
\`\`\`

Finally, let's create a detailed Supabase integration guide:
