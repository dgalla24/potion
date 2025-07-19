# GoalAI 🎯

An intelligent goal planning application that uses AI to break down your goals into actionable, calendar-based tasks with adaptive planning and progress tracking.

![GoalAI Demo](https://img.shields.io/badge/Status-Active-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38A169)

## ✨ Features

### 🤖 AI-Powered Goal Planning
- **Intelligent Task Breakdown**: AI analyzes your goals and creates detailed, actionable plans
- **Calendar Integration**: Automatically schedules tasks on your calendar with realistic timelines
- **Adaptive Planning**: AI adjusts difficulty and pacing based on your progress and feedback

### 📅 Interactive Calendar Interface
- **Monthly & Weekly Views**: Switch between different calendar perspectives
- **Visual Task Management**: Color-coded tasks by type (daily, weekly, milestones)
- **Status Tracking**: Mark tasks as Not Started, In Progress, or Completed
- **Click-to-Edit**: Click any task to open a detailed modal for status updates

### 💬 Cursor-Style Layout
- **Split-Screen Design**: Calendar always visible on the left, AI chat on the right
- **Real-time Updates**: Chat with AI and see tasks populate your calendar instantly
- **Persistent Storage**: Your goals and progress are saved locally

### 📊 Progress Analytics
- **Usage Tracking**: Monitor your AI interactions and goal planning activity
- **Visual Progress**: See your completion status at a glance
- **Historical Data**: Track your planning patterns over time

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- LiteLLM API key (for AI functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/goal-ai.git
   cd goal-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your LiteLLM API key to `.env.local`:
   ```
   LITELLM_API_KEY=your_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 How to Use

### 1. Create Your First Goal
- Visit the demo page at `/demo`
- Type a goal like: *"I want to read a 500-page book in 3 months"*
- The AI will break it down into daily, weekly, and milestone tasks

### 2. Manage Your Calendar
- **View Tasks**: See all your tasks organized on the calendar
- **Change Status**: Click any task to open the modal and update its status
- **Navigate**: Use the arrow buttons to move between months/weeks
- **Toggle Views**: Switch between monthly and weekly perspectives

### 3. Track Progress
- **Visual Indicators**: Tasks change color based on status
- **Completion Tracking**: Mark tasks as completed to see your progress
- **AI Feedback**: Chat with the AI to adjust your plan as needed

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: LiteLLM API
- **State Management**: React Hooks + localStorage
- **Deployment**: Vercel-ready

## 📁 Project Structure

```
goal-ai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/          # AI chat endpoint
│   │   │   └── signup/        # Email signup endpoint
│   │   ├── demo/              # Main application page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   └── components/            # Reusable components
├── public/                    # Static assets
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with:

```env
LITELLM_API_KEY=your_litellm_api_key_here
```

### API Endpoints

- `POST /api/chat` - AI chat endpoint for goal planning
- `POST /api/signup` - Email signup endpoint (ready for integration)

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add your `LITELLM_API_KEY` environment variable
   - Deploy!

### Environment Variables for Production

Make sure to set these in your Vercel dashboard:
- `LITELLM_API_KEY` - Your LiteLLM API key

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- AI powered by [LiteLLM](https://litellm.ai/)
- Icons from [Heroicons](https://heroicons.com/)

## 📞 Support

If you have any questions or need help, feel free to:
- Open an issue on GitHub
- Reach out via email
- Check the documentation

---

**Made with ❤️ by [Your Name]**

*Transform your goals into reality with AI-powered planning*
