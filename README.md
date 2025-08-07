# 👶 Baby Nurse Social Media Dashboard

Automated social media content management system for Baby Nurse daycare in São Paulo, Brazil.

## 🌟 Features

- **Real-time Post Management**: View and approve AI-generated posts instantly
- **One-Click Facebook Publishing**: Simple "Poste agora" button for immediate posting
- **Image Processing**: Automatic logo overlay and branding
- **Portuguese Content**: AI-generated content in Portuguese with local hashtags
- **Live Dashboard**: Real-time updates with WebSocket connections
- **Post Status Tracking**: Pending, Posted, Failed status management

## 🏗️ Architecture

```
n8n Workflow → Webhook → Next.js API → Supabase → Dashboard → Facebook API
```

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Database**: Supabase PostgreSQL with real-time subscriptions
- **Storage**: Supabase Storage for images
- **Authentication**: Supabase Row Level Security
- **Deployment**: Vercel (serverless)

## 🚀 Quick Start

### 1. Database Setup

Run the following SQL in your Supabase SQL Editor:

```sql
-- Execute the schema in supabase-schema.sql
```

### 2. Install Dependencies

```bash
cd baby-nurse-frontend
npm install
```

### 3. Environment Variables

Copy `.env.local` and update with your credentials:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://bpfigdfnfrlvidppbaxn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Facebook
FACEBOOK_ACCESS_TOKEN=your_page_access_token
FACEBOOK_PAGE_ID=your_page_id

# Security
WEBHOOK_SECRET=baby_nurse_webhook_secret_2024
```

### 4. Development

```bash
npm run dev
```

Visit: `http://localhost:3000/dashboard`

### 5. n8n Integration

Update your n8n workflow to replace the Gmail approval node with:

**HTTP Request Node:**
- Method: POST
- URL: `https://your-vercel-app.vercel.app/api/webhook`
- Body: JSON
```json
{
  "dataimage": "{{ $('Extract from File').item.json.dataimage }}",
  "output": "{{ $('AI Agent').item.json.output }}",
  "timestamp": "{{ new Date().toISOString() }}",
  "workflow_id": "{{ $workflow.id }}"
}
```

## 📱 Usage

1. **Automated Flow**: n8n runs at 7AM daily, processes images, sends to webhook
2. **Dashboard Review**: Posts appear in dashboard with image + content preview
3. **One-Click Approval**: Click "🚀 Poste agora" to publish to Facebook
4. **Real-time Updates**: Status changes instantly across all connected browsers
5. **Post Management**: Filter, sort, and delete posts as needed

## 🔧 API Endpoints

- `POST /api/webhook` - Receive n8n data
- `POST /api/facebook/post` - Publish to Facebook
- `GET /api/posts` - Fetch all posts
- `DELETE /api/posts?id=...` - Delete post

## 🚀 Deployment

### Vercel Deployment

```bash
npm i -g vercel
vercel --prod
```

Set environment variables in Vercel dashboard.

### Environment Variables on Vercel

Add all variables from `.env.local` to your Vercel project settings.

## 🧪 Testing

1. **Webhook Test**: `POST /api/webhook` with sample data
2. **Facebook Test**: Ensure page access token has posting permissions
3. **Real-time Test**: Open dashboard in multiple tabs, post should update everywhere

## 🔍 Troubleshooting

### Common Issues

1. **Images not loading**: Check Next.js config for Supabase domain
2. **Facebook posting fails**: Verify page access token and permissions
3. **Real-time not working**: Check Supabase RLS policies
4. **Webhook 500 errors**: Check service role key permissions

### Debug Mode

Enable debug logs by setting:
```bash
NODE_ENV=development
```

## 📊 Dashboard Features

- **Statistics Cards**: Total, Pending, Posted, Failed counts
- **Filtering**: Filter by post status
- **Sorting**: Newest/Oldest first
- **Real-time Updates**: Automatic refresh on changes
- **Image Preview**: Full-size images with branding
- **Content Preview**: Formatted Portuguese content
- **One-Click Actions**: Post, delete, view on Facebook

## 🎯 Business Impact

- **Time Savings**: Reduces daily posting from 1 hour to 2 minutes
- **Consistency**: Automated branding and content structure
- **Quality Control**: Human approval maintains content standards
- **Scalability**: Handles unlimited daily posts without staff increase

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📝 License

© 2024 Baby Nurse - Jardim Prudência, São Paulo
📞 (11) 5677-6432 • 🌐 babynurse.com.br

---

**Built with ❤️ for Brazilian daycare automation**