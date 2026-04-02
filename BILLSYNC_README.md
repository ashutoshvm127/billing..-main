# BillSync - Professional Billing Software

A modern, fully-featured billing and invoice management system built with Next.js, React, and TypeScript. Perfect for software companies, agencies, and service providers.

## Features

### ✅ Complete Features

- **Authentication System**
  - Login/Signup with company and user details
  - Secure session management with localStorage
  - Protected routes and layouts
  - Quick logout from any page

- **Invoice Management**
  - Create professional invoices with custom line items
  - Auto-generated invoice numbers (INV-YYYY-XXXX format)
  - Track invoice status (Draft, Sent, Paid, Overdue)
  - Professional invoice preview matching B2B standards
  - Print and export functionality
  - Complete invoice templates with company branding

- **Client Management**
  - Add and organize client information
  - Store contact details, company info, and addresses
  - Quick client lookup for invoice creation
  - Client cards with full contact information

- **Payment Tracking**
  - Record payments for invoices
  - Multiple payment methods (Bank Transfer, Credit Card, Check, Cash, PayPal)
  - Track payment status (Completed, Pending, Failed)
  - Payment history and notes

- **Reports & Analytics**
  - Real-time revenue tracking
  - Monthly revenue charts
  - Invoice status breakdown (Pie charts)
  - Outstanding payment tracking
  - Payment collection statistics

- **Dashboard**
  - Real-time billing metrics
  - Recent invoices widget
  - Outstanding payments summary
  - Quick action buttons
  - Dark mode support

- **Animations**
  - Smooth page transitions (fade-in, slide-up, slide-down)
  - Staggered card reveals
  - Hover effects on interactive elements
  - Loading states

## Getting Started

### Login

1. Go to the application
2. You'll be redirected to the login page
3. Enter any credentials (demo mode):
   - Full Name: Your name
   - Company Name: Your company name
   - Email: Your email
   - Password: Any password

### Create an Invoice

1. Click **Invoices** in the sidebar
2. Click **New Invoice**
3. Fill in:
   - Client name and email
   - Due date
   - Add line items (description, quantity, rate)
   - Optional notes
4. Click **Create Invoice**
5. View the invoice in the table and click the eye icon to preview

### Add Clients

1. Click **Clients** in the sidebar
2. Click **Add Client**
3. Fill in client information
4. Click **Add Client**

### Record Payments

1. Click **Payments** in the sidebar
2. Click **Record Payment**
3. Enter:
   - Invoice number
   - Payment amount
   - Payment method
   - Payment date
   - Status
4. Click **Record Payment**

### View Reports

1. Click **Reports** in the sidebar
2. See real-time analytics:
   - Total revenue
   - Invoice count
   - Payment collection rate
   - Monthly revenue chart
   - Invoice status breakdown

## Data Management

All data is stored locally in your browser using localStorage:
- **billingInvoices** - All invoice data
- **billingClients** - Client information
- **billingPayments** - Payment records
- **billingUser** - Authentication data

### Clear Data

In Settings → Danger Zone, you can clear all data at once.

## Invoice Details

Professional invoices include:
- Invoice number (auto-generated)
- Company and client information
- Line items with quantities and rates
- Automatic total calculation
- Due date tracking
- Payment status
- Optional notes

## Pages & Routes

- `/login` - Login page
- `/dashboard` - Main dashboard with metrics
- `/invoices` - Invoice management
- `/clients` - Client management
- `/payments` - Payment tracking
- `/reports` - Analytics and reports
- `/settings` - Account settings

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: shadcn/ui, Radix UI
- **Charts**: Recharts
- **Icons**: Lucide React
- **Styling**: Tailwind CSS
- **Dark Mode**: next-themes
- **Storage**: localStorage (client-side)
- **Forms**: React Hook Form

## Color Scheme

- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Error**: Red (#EF4444)
- **Warning**: Yellow (#F59E0B)
- **Neutral**: Gray scale

## Features by Page

### Dashboard
- Revenue metrics cards
- Recent invoices list
- Outstanding payments
- Quick action buttons
- Dark mode toggle

### Invoices
- Create new invoices
- Invoice table view
- View/Preview invoices
- Download invoices
- Delete invoices
- Status filtering

### Clients
- Add client information
- Client card grid
- Contact information
- Delete clients

### Payments
- Record new payments
- Payment method selection
- Payment status tracking
- Payment history table
- Total payment metrics

### Reports
- Total revenue tracking
- Invoice count
- Collection rate statistics
- Monthly revenue line chart
- Invoice status pie chart
- Recent invoice summary

### Settings
- Account information view
- Notification preferences
- Security settings
- Data management (clear all)
- Logout option

## Tips & Best Practices

1. **Invoice Numbers**: Automatically generated in format INV-2024-XXXX
2. **Status Management**: Use status to track invoice lifecycle
3. **Payment Tracking**: Record payments to track collection rates
4. **Client Organization**: Add all clients upfront for easier invoice creation
5. **Reports**: Check reports monthly for business insights

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

Planned features:
- Backend database integration
- Email invoice delivery
- Recurring invoices
- Multi-currency support
- Tax calculations
- Custom invoice templates
- Client portal
- Payment gateway integration

## Support

For issues or questions, please check the settings page or clear your browser cache if experiencing issues.

---

**BillSync** - Making billing simple and professional. Built with ❤️ for business owners.
