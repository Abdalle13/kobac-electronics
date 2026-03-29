import bcrypt from 'bcryptjs';

const users = [
  {
    name: 'Admin User',
    email: 'admin@kobac.com',
    password: 'password123',
    role: 'Admin',
  },
  {
    name: 'Customer',
    email: 'customer@test.com',
    password: 'password123',
    role: 'Customer',
  },
];

export default users;
