function cleanUsersTable(db) {
  return db.raw(
    `TRUNCATE users RESTART IDENTITY CASCADE`
  );
}

function cleanSavesTable(db) {
  return db.raw(
    `TRUNCATE user_saves RESTART IDENTITY CASCADE`
  )
}

module.exports = {
  cleanUsersTable,
  cleanSavesTable
};
