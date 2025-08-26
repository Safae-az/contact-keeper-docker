db = db.getSiblingDB('mydatabase');

db.createCollection("users");
db.users.insertMany([
  { name: "John Doe", email: "john@example.com" },
  { name: "Jane Smith", email: "jane@example.com" }
]);
