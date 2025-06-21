# AI Assistant for Developers

A developer productivity tool powered by Google's Gemini AI. The backend is built with Node.js and Express, while the frontend leverages React and Webpack to deliver a dynamic, responsive user interface. The application supports code explanation, automatic fixes, API suggestions, documentation generation, code comparison, and history tracking—all within a sleek dark-mode UI.

## Features

- **README Generation**: Automatically craft professional project README files.
- **API Suggestions**: Receive intelligent endpoint design and parameter recommendations.
- **Code Explanation**: Get detailed, line-by-line analysis of your source code.
- **Code Fixing**: Generate AI-driven patches to address code issues.
- **Code Comparison**: Visualize side-by-side diffs of different code versions.
- **History Tracking**: Review and revisit all previous AI interactions.
- **Dark Mode**: Optimized for low-light environments.
- **Responsive Design**: Fully functional across desktop and mobile devices.
- **Rate Limiting**: Smooth usage controls with clear notifications.

## Tech Stack

**Backend**
- Node.js & Express
- MongoDB for persistent history storage
- Google Gemini AI API
- Multer for file uploads
- Zod for request and response schema validation

**Frontend**
- React (v18) & React Router (v6)
- Webpack for bundling and development server
- Bootstrap 5 for styling
- Marked.js for Markdown rendering
- Highlight.js for code syntax highlighting
- Diff2Html for code comparison visualization

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB installed and running
- Google Gemini API key

## Installation

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd ai-assistant-for-developers
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file at the project root with:
   ```env
   PORT=5000
   MONGODB_URI=<your-mongodb-connection-string>
   GEMINI_API_KEY=<your-gemini-api-key>
   ```

## Docker

You can containerize the entire application using Docker and Docker Compose.

### Development

Build and start both the backend and frontend in development mode:
```bash
docker-compose up --build
```
The API will be available at `http://localhost:5000` and the React UI at `http://localhost:8080`.

### Production

Build and run production containers in detached mode:
```bash
docker-compose -f docker-compose.prod.yml up --build -d
```
To stop the services:
```bash
docker-compose -f docker-compose.prod.yml down
```

Alternatively, build and run the Docker image manually:
```bash
docker build -t ai-assistant .
docker run -p 5000:5000 ai-assistant
```

## Development

- Start the backend server with live reloading:
  ```bash
  npm run dev
  ```
- Run the React development server:
  ```bash
  npm run client
  ```
- The Express API will be available at `http://localhost:5000` and the React UI at `http://localhost:8080` (or your configured port).

## Production Build & Deployment

1. Build the frontend assets:
   ```bash
   npm run build:client
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Your full-stack application will serve the optimized React bundle alongside the API on the same port.

## Project Structure

```
.
├── src
│   ├── app.js               # Express application entry point
│   ├── config               # Configuration for AI, database, and app settings
│   ├── controllers          # Route handlers for AI endpoints
│   ├── middleware           # Custom Express middleware
│   ├── models               # Database schemas and models
│   ├── repositories         # Data access and schema management
│   ├── router               # API route definitions
│   ├── services             # Business logic for AI interactions
│   ├── utils                # Helper modules (prompt handling, formatting)
│   └── views
│       ├── home.html        # Static HTML shell for React
│       └── src              # React source files and components
├── webpack.config.js        # Webpack configuration
├── package.json             # Scripts and dependencies
└── README.md                # This file
```

## API Endpoints

| Method | Endpoint             | Description                             |
| ------ | -------------------- | --------------------------------------- |
| POST   | `/api/readme`        | Generate a project README.              |
| POST   | `/api/suggest-api`   | Generate API endpoint suggestions.      |
| POST   | `/api/explain-code`  | Explain code with annotated feedback.   |
| POST   | `/api/fix-code`      | Apply AI-generated fixes to code.       |
| POST   | `/api/compare-code`  | Compare two versions of code visually.  |
| GET    | `/api/history`       | Retrieve past AI interactions history.  |

## Contributing

We welcome contributions! To get started:

1. Fork the repository
2. Create a new feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m "Add YourFeature"`)
4. Push to your branch (`git push origin feature/YourFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Google Gemini AI for powering the code analysis
- Express.js community for the robust web framework
- All contributors who have helped improve this tool
