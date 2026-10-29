import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import hospitalRoutes from './routes/hospitalRoutes';
import bedRoutes from './routes/bedRoutes';
import adminRoutes from './routes/adminRoutes';
import bloodRoutes from './routes/bloodRoutes';
import navigationRoutes from './routes/navigationRoutes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/beds', bedRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blood', bloodRoutes);
app.use('/api/navigation', navigationRoutes);


const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-connect-new';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(Number(PORT), '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
  })

  .catch(err => console.error(err));
