import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'payments.json');

app.use(express.json());

// CORS for local dev (optional)
app.use((req,res,next)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS') return res.sendStatus(200);
  next();
});

// Ensure data directory
fs.mkdirSync(path.join(__dirname,'data'), { recursive: true });
if(!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf-8');

// API
app.get('/api/payments', (req,res)=>{
  const raw = fs.readFileSync(DATA_FILE,'utf-8');
  res.json(JSON.parse(raw));
});

app.post('/api/payments', (req,res)=>{
  const rec = req.body || {};
  // basic validation
  if(!rec || !rec.method) return res.status(400).json({error:'method required'});
  if(rec.method==='UPI' && !rec.upiId) return res.status(400).json({error:'upiId required for UPI'});
  rec.serverTime = new Date().toISOString();
  let arr = JSON.parse(fs.readFileSync(DATA_FILE,'utf-8'));
  arr.push(rec);
  fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2));
  res.status(201).json({ok:true});
});

app.delete('/api/payments', (req,res)=>{
  fs.writeFileSync(DATA_FILE, '[]');
  res.json({ok:true});
});

// Static hosting
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req,res)=>{
  res.sendFile(path.join(__dirname,'public','index.html'));
});

app.listen(PORT, ()=>{
  console.log(`Mystic Craft server running on http://localhost:${PORT}`);
});
