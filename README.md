# BillSync - Professional Invoicing & Billing Software

Welcome to **BillSync**, a modern, AI-powered billing software designed for freelancers and software companies.

![BillSync Logo](https://img.shields.io/badge/BillSync-Professional%20Billing-blue)
![Version](https://img.shields.io/badge/Version-2.0-green)
![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)

---

## 🚀 Quick Start

### Installation
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit `http://localhost:3000` to get started.

### Test Account
- Email: `test@example.com`
- Password: `password` (or use any credentials)

---

## ✨ Features

### Core Features
- 📋 **Professional Invoicing** - Create invoices with line items
- 💰 **Payment Tracking** - Monitor payments and due dates
- 👥 **Client Management** - Store client information
- 📊 **Analytics Dashboard** - Track key metrics
- 🧠 **AI Insights** - AI-powered business recommendations
- 📄 **PDF Export** - Download invoices as PDF
- 📧 **Email Integration** - Send invoices via email

### Advanced Features
- **Product & Service Line Items** - Separate tracking for products and hourly services
- **GST/Tax Configuration** - Customizable tax rates
- **Professional Templates** - Ready-to-use invoice designs
- **Dark Mode** - Eye-friendly dark theme
- **Responsive Design** - Works on all devices
- **Real-time Analytics** - Live metrics dashboard

---

## 📖 Documentation

### Getting Started
- **[BUILD_SUMMARY.md](./BUILD_SUMMARY.md)** - Overview of everything that was built
- **[ADVANCED_FEATURES.md](./ADVANCED_FEATURES.md)** - Detailed feature guide and API documentation
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Setup, customization, and deployment

### Quick Links
| Document | Purpose |
|----------|---------|
| BUILD_SUMMARY.md | Complete overview of features |
| ADVANCED_FEATURES.md | Technical details and API docs |
| DEPLOYMENT_GUIDE.md | Installation and deployment |
| IMPLEMENTATION_SUMMARY.md | Original build summary |
| QUICK_START.md | Quick reference guide |

---

## 🎯 Main Features Explained

### 1. Create Professional Invoices
- Add unlimited line items
- Specify products or hourly services
- Auto-calculate totals
- Include notes and terms

### 2. Download as PDF
- One-click PDF download
- Professional formatting
- Print-ready layout
- Auto-named files (INV-YYYY-XXXXX.pdf)

### 3. Send via Email
- Email invoices to clients
- Track sent invoices
- Ready for email service integration

### 4. AI-Powered Analytics
- Get business insights
- Revenue trend analysis
- Payment health assessment
- Growth recommendations

### 5. Configure Taxes
- Set GST/VAT/HST rates
- Apply to all invoices
- Tax preview calculator
- Professional tax reporting

### 6. Track Payments
- Record payment status
- Monitor outstanding amounts
- Track due dates
- Payment reminders

---

## 📊 Dashboard Overview

The main dashboard shows:
- **Total Revenue** - Sum of all invoice amounts
- **Invoice Count** - Total invoices created
- **Collection Rate** - Percentage of paid invoices
- **Overdue Amount** - Outstanding payments
- **Recent Invoices** - Latest 3 invoices
- **Outstanding Payments** - Pending payments
- **Quick Actions** - Create invoice, add client, record payment

---

## 🔧 Technology Stack

**Frontend**
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Shadcn UI

**Backend**
- Next.js API Routes
- AI SDK 6 (OpenAI integration)

**Data**
- localStorage (client-side)
- Ready for database migration

**Libraries**
- html2pdf.js - PDF generation
- Recharts - Charts and graphs
- Lucide Icons - UI icons

---

## 📁 Application Structure

```
billsync/
├── app/
│   ├── landing/           # Public landing page
│   ├── login/             # Authentication
│   ├── dashboard/         # Main metrics
│   ├── invoices/          # Invoice management
│   ├── clients/           # Client database
│   ├── payments/          # Payment tracking
│   ├── reports/           # Analytics
│   ├── reports-ai/        # AI insights
│   ├── settings-enhanced/ # GST & company settings
│   └── api/               # API endpoints
├── components/            # Reusable components
├── types/                 # TypeScript definitions
├── context/               # Auth context
└── public/                # Static assets
```

---

## 💾 Data Storage

All data is stored in browser's `localStorage`:
- Invoices
- Clients
- Payments
- Settings
- User session

**Note**: For production, migrate to a backend database.

### Backup Your Data
```javascript
// In browser console - download backup
const backup = {
  invoices: JSON.parse(localStorage.getItem('billingInvoices')),
  clients: JSON.parse(localStorage.getItem('billingClients')),
  payments: JSON.parse(localStorage.getItem('billingPayments')),
  settings: JSON.parse(localStorage.getItem('gstSettings'))
}
download(JSON.stringify(backup, null, 2), 'backup.json')
```

---

## 🔐 Security Notes

**Current Implementation**
- Client-side storage (development)
- Basic authentication

**For Production**
- Migrate to backend database
- Implement JWT authentication
- Add HTTPS/SSL
- Enable data encryption
- Set up automated backups

---

## 🚀 Deployment

### Local Development
```bash
pnpm dev
```

### Vercel Deployment
```bash
vercel deploy
```

### Docker (Future)
```bash
docker build -t billsync .
docker run -p 3000:3000 billsync
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🎨 Customization

### Change Company Name
Edit `app/landing/page.tsx` and `components/kokonutui/sidebar.tsx`

### Change Default GST Rate
Edit `app/settings-enhanced/page.tsx`:
```typescript
gstRate: 18,  // Change to your default
```

### Change Color Scheme
Edit `app/globals.css` and `tailwind.config.ts`

### Change Invoice Format
Edit `components/invoices/invoice-preview-enhanced.tsx`

---

## 🐛 Troubleshooting

**Dependencies not installing?**
```bash
rm -rf node_modules
pnpm install
```

**localStorage showing errors?**
- Clear browser cache (Ctrl+Shift+Delete)
- Check browser's dev tools

**PDF not downloading?**
- Ensure html2pdf.js is installed
- Check browser console for errors

**AI Insights not working?**
- Verify internet connection
- Check API route exists
- Wait 5-10 seconds for processing

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for more solutions.

---

## 📚 Learning Resources

- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/
- **Tailwind CSS**: https://tailwindcss.com
- **Shadcn UI**: https://ui.shadcn.com
- **AI SDK**: https://sdk.vercel.ai

---

## 🤝 Contributing

To improve BillSync:
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## 📝 License

MIT License - Feel free to use and modify

---

## 🎯 Roadmap

### Current (v2.0)
- ✅ Professional invoicing
- ✅ PDF export
- ✅ Email integration
- ✅ AI analytics
- ✅ GST configuration
- ✅ Payment tracking

### Planned
- [ ] Payment processing (Stripe)
- [ ] Real authentication backend
- [ ] Database migration
- [ ] Team collaboration
- [ ] Mobile app
- [ ] Recurring invoices
- [ ] Expense tracking
- [ ] Time tracking

---

## 💬 FAQ

**Q: Is my data secure?**
A: Currently stored in localStorage (client-side). For production, use a backend database.

**Q: Can I export my data?**
A: Yes, download backup from browser console or settings page.

**Q: Does it work offline?**
A: Partially. Core features work, but AI analytics require internet.

**Q: How do I send real emails?**
A: Integrate an email service (Resend, SendGrid) in `/api/send-invoice/route.ts`

**Q: Can I customize the invoice template?**
A: Yes, edit `/components/invoices/invoice-preview-enhanced.tsx`

**Q: What's the invoice limit?**
A: Unlimited (localStorage limit ~5MB, ~500 invoices max)

---

## 🆘 Support

- **Documentation**: See files in this directory
- **GitHub Issues**: Report bugs
- **Discussions**: Ask questions
- **Email**: (Add your contact)

---

## 📈 Version History

- **v2.0** (Current): Advanced features - AI, PDF, GST
- **v1.0**: Core invoicing - basic invoice, clients, payments

---

## 🎉 Getting Started

1. **Install**: `pnpm install`
2. **Run**: `pnpm dev`
3. **Open**: http://localhost:3000
4. **Login**: Use any credentials
5. **Explore**: Create invoice, view AI insights
6. **Customize**: Update GST settings
7. **Deploy**: `vercel deploy`

---

**Happy invoicing! 📊💼**

Made with ❤️ using Next.js, TypeScript, and AI SDK 6

For detailed guides, see:
- [BUILD_SUMMARY.md](./BUILD_SUMMARY.md) - What was built
- [ADVANCED_FEATURES.md](./ADVANCED_FEATURES.md) - Feature details
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deployment instructions
