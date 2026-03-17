import 'dotenv/config';
import express from 'express';

import cardsRouter from './routes/cards.js';
import collectionRouter from './routes/collection.js';
import chaseRouter from './routes/chase.js';
import bindersRouter from './routes/binders.js';
import boxesRouter from './routes/boxes.js';
import pricingRouter from './routes/pricing.js';

const app = express();
app.use(express.json());

app.use('/api/cards', cardsRouter);
app.use('/api/collection', collectionRouter);
app.use('/api/chase', chaseRouter);
app.use('/api/binders', bindersRouter);
app.use('/api/boxes', boxesRouter);
app.use('/api/pricing', pricingRouter);

app.get('/health', (_req, res) => res.json({ ok: true }));

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API running on port ${port}`));
