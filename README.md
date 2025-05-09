# AI Assistant for Developers

A modern web application powered by Google's Gemini AI that helps developers with various coding tasks including code explanation, fixing, API suggestions, and documentation generation.

## Features

- 🚀 **README Generation**: Automatically generate professional README files for your projects
- 🔍 **Code Explanation**: Get detailed line-by-line explanations of your code
- 🛠️ **Code Fixing**: Identify and fix issues in your code with AI-powered suggestions
- 📚 **API Suggestions**: Get intelligent API endpoint structure suggestions
- 🔄 **Code Comparison**: Compare different versions of code and analyze changes
- 📝 **History Tracking**: Keep track of all your previous interactions
- 🌙 **Dark Mode Support**: Built-in dark mode for better viewing experience
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- ⏳ **Smart Rate Limiting**: User-friendly rate limit notifications with progress indicators
- 🔔 **Enhanced Notifications**: Clear and informative notifications for all actions

## Tech Stack

- **Backend**:
  - Node.js with Express
  - EJS templating engine
  - Google Gemini AI API
  - MongoDB for history tracking
- **Frontend**:
  - Modern CSS with responsive design
  - Marked.js for Markdown rendering
  - Highlight.js for code syntax highlighting
  - Diff2Html for code comparison visualization

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v16 or higher)
- MongoDB installed and running
- Google Gemini API key

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd ai-assistant-for-developers
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:

   ```env
   PORT=5000
   MONGODB_URI=<your-mongodb-connection-string>
   GEMINI_API_KEY=<your-gemini-api-key>
   ```

4. Start the application:
   ```bash
   npm start
   ```

## Project Structure

```
app.js                 # Application entry point
config/               # Configuration files
├── aiConfig.js       # AI-related configurations
├── appConfig.js      # Application settings
└── schema.js        # Response schema definitions
controllers/         # Request handlers
db/                 # Database related files
middleware/         # Express middleware
├── filesReader.js  # File upload handling
└── rateLimiter.js # Rate limiting with user notifications
public/             # Static files
├── css/           # Stylesheets
└── js/            # Client-side JavaScript
router/            # Route definitions
utils/             # Utility functions
views/             # EJS templates
```

## Features in Detail

### Rate Limiting

The application includes a sophisticated rate limiting system that:

- Limits requests to prevent API abuse
- Shows user-friendly notifications with:
  - Current usage statistics
  - Time until next available request
  - Visual progress indicators
- Graceful error handling with clear feedback

### Code Analysis

- Line-by-line code explanations
- Issue detection and fixing suggestions
- Code comparison with visual diff
- Support for multiple programming languages

### API Documentation

- Smart API endpoint suggestions
- Request/Response schema generation
- HTTP method recommendations
- Parameter documentation

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Gemini AI for powering the code analysis
- Express.js community for the robust web framework
- All contributors who have helped improve this tool
