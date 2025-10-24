const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register new user
exports.register = async (req, res) => {
  try {
    const { 
      email, 
      phone, 
      password, 
      fullName, 
      dateOfBirth, 
      gender,
      disabilityStatus,
      disabilityDetails,
      state,
      district
    } = req.body;
    
    // Validate required fields
    if (!email || !phone || !password || !fullName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields: email, phone, password, fullName' 
      });
    }
    
    // Check if user already exists
    const [existingUser] = await db.query(
      'SELECT * FROM users WHERE email = ? OR phone = ?',
      [email, phone]
    );
    
    if (existingUser.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email or phone already exists' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user into database
    const [result] = await db.query(
      `INSERT INTO users (
        email, phone, password_hash, full_name, date_of_birth, gender,
        disability_status, disability_details, state, district
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        email, 
        phone, 
        hashedPassword, 
        fullName, 
        dateOfBirth || null, 
        gender || null,
        disabilityStatus || 'None',
        disabilityDetails || null,
        state || null,
        district || null
      ]
    );
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: result.insertId, 
        email: email 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    
    // Log registration activity
    await db.query(
      'INSERT INTO activity_log (user_id, activity_type, activity_details) VALUES (?, ?, ?)',
      [result.insertId, 'registration', JSON.stringify({ email, registeredAt: new Date() })]
    );
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        userId: result.insertId,
        fullName,
        email,
        phone,
        disabilityStatus: disabilityStatus || 'None'
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }
    
    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }
    
    const user = users[0];
    
    // Check if account is active
    if (user.account_status !== 'Active') {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is suspended. Please contact support.' 
      });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }
    
    // Update last login timestamp
    await db.query(
      'UPDATE users SET last_login = NOW() WHERE user_id = ?',
      [user.user_id]
    );
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.user_id, 
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        userId: user.user_id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        disabilityStatus: user.disability_status,
        preferredLanguage: user.preferred_language,
        accessibilityPreferences: {
          fontSize: user.font_size,
          colorTheme: user.color_theme,
          voiceEnabled: user.voice_enabled
        }
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // from JWT middleware
    
    const [users] = await db.query(
      `SELECT user_id, email, phone, full_name, date_of_birth, gender,
              disability_status, disability_details, state, district,
              preferred_language, font_size, color_theme, voice_enabled,
              registered_at, last_login
       FROM users WHERE user_id = ?`,
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      user: users[0]
    });
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve profile' 
    });
  }
};
