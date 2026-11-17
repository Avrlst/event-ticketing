import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from "./routes/auth.routes";
import eventRoutes from "./routes/event.route";
import orderRoutes from "./routes/order.route";
import webhookRoutes from "./routes/webhook.route";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/webhooks", webhookRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Ticketing API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});