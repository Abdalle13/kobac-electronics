import jsonwebtoken from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jsonwebtoken.sign({ userId }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });

  // Set JWT as HTTP-Only Cookie? For now we'll just return it via JSON as per typical API auth,
  // but if you want cookie-based auth, we can implement res.cookie(...) here.
  return token;
};

export default generateToken;
