module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    REDIRECT_URI: 'https://get-it-to-the-table.vercel.app/bga-auth/',
    DATABASE_URL: 'postgresql://chris@localhost/food-desert',
    GRANT_TYPE: 'authorization code',
    STATE: process.env.STATE
  }