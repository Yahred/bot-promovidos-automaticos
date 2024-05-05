db = db.getSiblingDB('promovidos');

db.createUser({
  user: 'admin',
  pwd: 'admin',
  roles: [
    {
      role: 'readWrite',
      db: 'promovidos'
    },
  ],
});
