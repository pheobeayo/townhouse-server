### Development setup guide

This file aims to assist contributors on how to setup / configure and run this project locally on their machine or from server.

### 💻 Running locally

```bash
git clone https://github.com/aimset-hackathon-team6/Townhall-server
cd Townhall-server
npm install
```
Create a `.env` file, copy and paste the environment variable specified in `.env.example` 
Remember to edit the environment variables in `.env` as per your preferrence.

Run development server
```bash
npm run dev
```

Building
```bash
npm run build
```

### 🌍 Where to deploy

Vercel
Render
Heroku
and other cloud hosting providers with `Nodejs` support.

### DBMS

We've used PostgreSQL and PgAdmin 4
We've used `sqlx-cli` to initiate and run our sql migrations

To create a migration folder
```bash
sqlx migrate add -r init
```
To Run migrations
```bash
sqlx migrate run
```

