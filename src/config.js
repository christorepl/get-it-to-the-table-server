module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    CLIENT_ORIGIN: 'https://get-it-to-the-table.vercel.app',
    DATABASE_URL: process.env.DATABASE_URL,
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    REDIRECT_URI: 'https://get-it-to-the-table.vercel.app/bga-auth/',
    GRANT_TYPE: 'authorization code',
    jwtSecret: process.env.jwtSecret
  }

  // 'postgresql://chris@localhost/gittt'
  // 'https://get-it-to-the-table.vercel.app'