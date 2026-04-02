# BillSync - Deployment & Setup Guide

## Quick Start

### Prerequisites
- Node.js 18+ installed
- pnpm or npm package manager
- Browser with localStorage support

### Installation

```bash
# Clone or extract the project
cd billsync

# Install dependencies
pnpm install
# or
npm install

# Start development server
pnpm dev
# or
npm run dev
```

The app will be available at `http://localhost:3000`

---

## Application Flow

### 1. User Journey
```
/ (Landing Check)
  ├─ Not Authenticated → /landing (Public landing page)
  └─ Authenticated → /dashboard (Main app)

/login → Create account or login
  → Sets auth token in localStorage
  → Redirects to /dashboard
```

### 2. Main Dashboard Routes
```
/dashboard          - Overview & metrics
/invoices          - Create, view, manage invoices
/clients           - Client database
/payments          - Payment tracking
/reports           - Traditional analytics
/reports-ai        - AI-powered insights
/settings-enhanced - Company & tax settings
```

---

## Features Quick Reference

| Feature | Location | Requires |
|---------|----------|----------|
| Create Invoice | `/invoices` | Client info, line items |
| Download PDF | Invoice preview | html2pdf.js library |
| Send Email | Invoice preview | Email service API |
| View AI Insights | `/reports-ai` | OpenAI API key (AI Gateway) |
| Configure GST | `/settings-enhanced` | Company info |
| View Metrics | `/dashboard` | At least 1 invoice |

---

## Environment Variables (if using external services)

Create `.env.local` file in root directory:

```env
# For AI Analytics (Optional - uses Vercel AI Gateway by default)
# AI_GATEWAY_API_KEY=your_gateway_key_here

# For Email Service (Optional - demo mode by default)
# SENDGRID_API_KEY=your_sendgrid_key
# RESEND_API_KEY=your_resend_key

# For PDF Service (Optional - uses client-side by default)
# No environment variables needed

# For Production Database (Future)
# DATABASE_URL=your_database_url
# DATABASE_PASSWORD=your_password
```

---

## Build for Production

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

---

## File Structure

```
billsync/
├── app/
│   ├── page.tsx              # Root redirect
│   ├── layout.tsx            # Root layout with auth provider
│   ├── landing/              # Public landing page
│   ├── login/                # Authentication page
│   ├── dashboard/            # Main dashboard
│   ├── invoices/             # Invoice management
│   ├── clients/              # Client management
│   ├── payments/             # Payment tracking
│   ├── reports/              # Traditional reports
│   ├── reports-ai/           # AI analytics
│   ├── settings-enhanced/    # Enhanced settings
│   └── api/
│       ├── send-invoice/     # Email API
│       └── ai-analytics/     # AI insights API
├── components/
│   ├── kokonutui/            # Main layout components
│   ├── invoices/             # Invoice forms & previews
│   ├── ui/                   # Shadcn UI components
│   ├── auth-context.tsx      # Authentication provider
│   └── protected-layout.tsx  # Protected route wrapper
├── types/
│   └── invoice.ts            # TypeScript interfaces
├── context/
│   └── auth-context.tsx      # Auth provider
├── public/                   # Static assets
└── package.json             # Dependencies

```

---

## Data Persistence

### localStorage Keys
```javascript
// Check stored data in browser dev tools
// Application → Storage → Local Storage

billingUser         // { email, password, companyName, name }
billingInvoices     // Array of all invoices
billingClients      // Array of all clients
billingPayments     // Array of all payments
gstSettings         // { gstRate, companyInfo, etc }
```

### Backup Your Data
```javascript
// In browser console
const backup = {
  invoices: JSON.parse(localStorage.getItem('billingInvoices') || '[]'),
  clients: JSON.parse(localStorage.getItem('billingClients') || '[]'),
  payments: JSON.parse(localStorage.getItem('billingPayments') || '[]'),
  settings: JSON.parse(localStorage.getItem('gstSettings') || '{}'),
  user: JSON.parse(localStorage.getItem('billingUser') || '{}')
}

// Download as JSON file
const dataStr = JSON.stringify(backup, null, 2)
const dataBlob = new Blob([dataStr], { type: 'application/json' })
const url = URL.createObjectURL(dataBlob)
const link = document.createElement('a')
link.href = url
link.download = `billsync-backup-${Date.now()}.json`
link.click()
```

### Restore from Backup
```javascript
// In browser console
const backupData = { /* your backup JSON */ }

localStorage.setItem('billingInvoices', JSON.stringify(backupData.invoices))
localStorage.setItem('billingClients', JSON.stringify(backupData.clients))
localStorage.setItem('billingPayments', JSON.stringify(backupData.payments))
localStorage.setItem('gstSettings', JSON.stringify(backupData.settings))
localStorage.setItem('billingUser', JSON.stringify(backupData.user))

location.reload()
```

---

## Customization

### Change Company Branding
Edit `/app/landing/page.tsx` and components to:
- Change logo color/style
- Update company name "BillSync"
- Modify brand colors
- Update feature descriptions

### Change GST Rate Default
Edit `/app/settings-enhanced/page.tsx`:
```typescript
gstRate: 18,  // Change this value
```

### Change Invoice Number Format
Edit `/components/invoices/enhanced-invoice-form.tsx`:
```typescript
invoiceNumber: initialData?.invoiceNumber || `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`
```

### Customize Colors
Edit `app/globals.css` and `tailwind.config.ts`:
- Primary color: `blue-600`
- Accent colors: `green`, `red`, `yellow`
- Dark mode: Uses `dark:` prefix

---

## Testing Checklist

- [ ] Create invoice with line items
- [ ] Download invoice as PDF
- [ ] Send invoice email (check console)
- [ ] Create multiple clients
- [ ] Record payments
- [ ] View AI analytics
- [ ] Update GST settings
- [ ] Test dark mode toggle
- [ ] Test mobile responsiveness
- [ ] Logout and login again

---

## Common Issues & Solutions

### Issue: Dependencies not installing
```bash
# Clear node_modules and reinstall
rm -rf node_modules
rm pnpm-lock.yaml  # or package-lock.json
pnpm install
```

### Issue: localStorage showing [object Object]
- Clear browser cache: Settings → Clear browsing data
- Reload page: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Issue: PDF download not working
```bash
# Verify html2pdf.js is installed
pnpm list html2pdf.js

# If not installed
pnpm add html2pdf.js
```

### Issue: AI Insights returning error
- Check network tab in dev tools
- Verify API route exists at `/api/ai-analytics`
- For Vercel deployment, ensure AI Gateway is enabled
- Check AI model availability

### Issue: Email not sending
- Currently in demo mode (logs to console)
- To enable real emails, integrate email service:
  - Resend: `pnpm add resend`
  - SendGrid: `pnpm add @sendgrid/mail`
  - Update `/api/send-invoice/route.ts`

---

## Vercel Deployment

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/billsync.git
git push -u origin main
```

### Step 2: Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or use Vercel Dashboard:
1. Go to vercel.com
2. Connect GitHub repository
3. Select billsync project
4. Click Deploy

### Step 3: Environment Variables
In Vercel Dashboard:
1. Go to Settings → Environment Variables
2. Add required variables (if using external services)
3. Redeploy

---

## Database Migration (Future)

When ready to move from localStorage to backend:

1. **Choose Database**:
   - PostgreSQL (Neon recommended)
   - MongoDB (Vercel MongoDB)
   - PlanetScale (MySQL)

2. **Update Data Models**:
   - Create database schema
   - Generate types from schema
   - Update API routes

3. **Migrate Data**:
   - Export from localStorage
   - Import to database
   - Update queries

4. **Switch Backend**:
   - Replace localStorage with DB queries
   - Test thoroughly
   - Monitor for issues

---

## Support & Resources

- **Documentation**: See `ADVANCED_FEATURES.md`
- **GitHub**: (Add your repo)
- **Issues**: Submit bug reports
- **Discussions**: Ask questions

---

## Version History

- **v2.0** (Current): Advanced features - AI analytics, PDF export, GST settings
- **v1.0**: Core invoicing - basic invoice creation, clients, payments

---

## License

MIT License - Feel free to use and modify

---

## Next Steps

1. ✅ Deploy to production
2. ✅ Set up custom domain
3. ✅ Configure email service
4. ✅ Add user authentication backend
5. ✅ Migrate to database
6. ✅ Set up backups
7. ✅ Monitor analytics
8. ✅ Scale infrastructure

**Happy billing! 🎉**
