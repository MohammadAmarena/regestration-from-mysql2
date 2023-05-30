import express, { Request, Response, NextFunction } from 'express';
import { createPool, RowDataPacket } from 'mysql2/promise';
import cors from 'cors';
import pkg from 'body-parser';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

const { json } = pkg;
const app = express();
const port = 3111;
const salt = 10;

app.use(json());
app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  })
);

app.use(cookieParser());

// Function to create a database connection pool
const createDBConnection = () => {
  return createPool({
    host: 'localhost',
    user: 'root',
    password: 'Mado.12345',
    database: 'signup',
  });
};


// Custom interface to extend the Request object with a currentUser property
interface CustomRequest extends Request {
  currentUser?: string; // Custom property for currentUser
}

// Middleware function to verify the user's authentication token
const verifyUser = (req: CustomRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (!token) {
    return res.json({ error: 'Not Authenticated' });
  }

  // Verify the token and set the currentUser property on the request object
  jwt.verify(token, 'm**1**', (err: any, decoded: any) => {
    if (err) {
      return res.json({ error: 'Token is not valid' });
    }

    req.currentUser = decoded.name;
    next();
  });
};

/**
 * Route: GET /
 * Description: Root route that requires user authentication.
 *              Returns the current user's name.
 */
app.get('/', verifyUser, (req: CustomRequest, res: Response) => {
  res.json({ Status: 'Success', name: req.currentUser });
});

/**
 * Route: GET /me
 * Description: Route to get the current user's information.
 *              Requires user authentication.
 */
app.get('/me', verifyUser, (req: CustomRequest, res: Response) => {
  try {
    const currentUser = req.currentUser;

    if (!currentUser) {
      res.json({ error: 'No token found' });
      return;
    }

    res.json({ currentUser });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Route: POST /register
 * Description: Route to register a new user.
 *              Hashes the password and inserts the user data into the database.
 */
app.post('/register', async (req: CustomRequest, res: Response) => {
  try {
    const pool = await createDBConnection();
    const sql = 'INSERT INTO signin (`name`, `email`, `password`) VALUES (?)';
    const hash = await bcrypt.hash(req.body.password, salt);
    const values = [req.body.name, req.body.email, hash];

    await pool.query(sql, [values]);
    pool.end();
    res.json({ status: 'Success' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Route: POST /signin
 * Description: Route to authenticate a user and generate an authentication token.
 *              Compares the provided password with the hashed password stored in the database.
 *              If the passwords match, a token is generated and returned. **/
app.post('/signin', async (req: CustomRequest, res: Response) => {
  try {
    const pool = await createDBConnection();
    const sql = 'SELECT * FROM signin WHERE email = ?';
    const [rows] = await pool.query<RowDataPacket[]>(sql, [req.body.email]);

    if (rows.length > 0) {
      const match = await bcrypt.compare(req.body.password, rows[0].password);

      if (match) {
        const name = rows[0].name;
        const token = jwt.sign({ name }, 'm**1**', { expiresIn: '1d' });

        res.cookie('token', token);
        res.json({ status: 'Success' });
      } else {
        res.json({ error: 'Password not matched' });
      }
    } else {
      res.json({ error: 'No email exists' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Route: GET /logout
 * Description: Route to log out the user.
 *              Clears the authentication token from the cookie.
 */
app.get('/logout', (req: CustomRequest, res: Response) => {
  res.clearCookie('token');
  res.json({ Status: 'Success' });
});

// Start the server
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
