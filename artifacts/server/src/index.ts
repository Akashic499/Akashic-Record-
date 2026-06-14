import express from 'express';
import cors from 'cors';
import { db } from './db';
import { usersRouter } from './routes/users';
import { recordsRouter } from './routes/records';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// --- ADDED THIS ROUTE TO FIX THE ERROR ---
// Root route: This handles the main URL (https://akashic-record.onrender.com)
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Akashic Record API</title></head>
      <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f0f2f5;">
        <h1 style="color: #1a73e8;">📚 Akashic Record Server is Live</h1>
        <p>The backend is running successfully and connected to Neon PostgreSQL.</p>
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
          <strong>Available Endpoints:</strong>
          <ul style="margin-top: 10px;">
            <li><code>/health</code> - Check server status</li>
            <li><code>/api/users</code> - User management</li>
            <li><code>/api/records</code> - Record management</li>
          </ul>
        </div>
      </body>
    </html>
  `);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Routes
app.use('/api/users', usersRouter);
app.use('/api/records', recordsRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📚 Database connected to Neon PostgreSQL`);
});

export default app;
