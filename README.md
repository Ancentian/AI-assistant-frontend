## Frontend Installation (Next.js + TailwindCSS)

1. Navigate to the frontend directory:

```bash
cd ../frontend
```

2. Install frontend dependencies:

```bash
npm install
```

3. Install additional packages:

```bash
npm install marked react-hot-toast
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install @heroicons/react
npm install marked
# or
yarn add marked
npm install marked-smartypants
npm install dompurify
```

4. Run the frontend development server:

```bash
npm run dev
```

---

## Deployment

### Backend Deployment

Make sure your server environment has Python and `pip` installed.  
Steps:

- Activate your virtual environment
- Install requirements (`pip install -r requirements.txt`)
- Ensure your `.env` is properly configured
- Run the backend server with:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Project Structure

```bash
ai-assistant/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   ├── requirements.txt
│   └── .env
│
└── frontend/
    ├── pages/
    ├── components/
    ├── styles/
    ├── public/
    └── tailwind.config.js
```
### Hosted frontend
- https://ai-assistant-ooc9-git-v11-ancents-projects.vercel.app


