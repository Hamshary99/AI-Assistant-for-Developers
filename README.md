# AI Assistant for Developers

A modern web application powered by Google's Gemini AI that helps developers with various coding tasks including code explanation, fixing, API suggestions, and documentation generation.

## Features

- 🚀 **README Generation**: Automatically generate professional README files for your projects
- 🔍 **Code Explanation**: Get detailed line-by-line explanations of your code
- 🛠️ **Code Fixing**: Identify and fix issues in your code with AI-powered suggestions
- 📚 **API Suggestions**: Get intelligent API endpoint structure suggestions
- 📝 **History Tracking**: Keep track of all your previous interactions
- 🌙 **Dark Mode Support**: Built-in dark mode for better viewing experience
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Backend**:
  - Node.js with Express.js
  - Google Gemini AI API
  - MongoDB for history storage
  - EJS templating engine

- **Frontend**:
  - Modern CSS with responsive design
  - Highlight.js for syntax highlighting
  - Diff2Html for code difference visualization
  - Marked for Markdown rendering

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
   ```
   GEMINI_API_KEY=your_gemini_api_key
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   ```

4. Start the application:
   ```bash
   # Development mode
   npm run dev

   # Production mode
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
public/             # Static files
├── css/           # Stylesheets
└── js/            # Client-side JavaScript
router/            # Route definitions
utils/             # Utility functions
views/             # EJS templates
└── layouts/       # Layout templates
```

## API Endpoints

- `POST /api/generate-readme`: Generate README files
- `POST /api/suggest-api`: Get API endpoint suggestions
- `POST /api/explain-code`: Get code explanations
- `POST /api/fix-code`: Get code fixes
- `GET /api/history`: Retrieve interaction history

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| GEMINI_API_KEY | Google Gemini AI API key | Yes |
| MONGODB_URI | MongoDB connection string | Yes |
| PORT | Application port (default: 5000) | No |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Gemini AI for providing the AI capabilities
- The Express.js community for the excellent web framework
- All the contributors who have helped shape this project

## Contact

If you have any questions or suggestions, please feel free to open an issue in the repository.