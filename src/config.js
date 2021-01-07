module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    CLIENT_ORIGIN: 'https://get-it-to-the-table.vercel.app',
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    REDIRECT_URI: 'https://get-it-to-the-table.vercel.app/bga-auth/',
    DATABASE_URL: process.env.DATABASE_URL,
    GRANT_TYPE: 'authorization code',
    STATE: process.env.STATE
  }

  // 'postgresql://chris@localhost/gittt'