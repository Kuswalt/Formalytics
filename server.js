const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10; 
const server = express();
server.use(bodyParser.json());

const app = express();
const cors = require('cors');
server.use(cors());

server.use(bodyParser.json());

let db;

function handleDisconnect() {
  db = mysql.createConnection({
    host: "153.92.15.9",
    user: "u438242536_db_tracer",
    password: "Arceo@2004",
    database: "u438242536_study_tracer"
  });

  db.connect(function (error) {
    if (error) {
      console.log("Error connecting to Db:", error);
      setTimeout(handleDisconnect, 2000); // Reconnect after 2 seconds
    } else {
      console.log("Connected!");
    }
  });

  db.on('error', function (error) {
    console.log('DB Error:', error);
    if (error.code === 'PROTOCOL_CONNECTION_LOST' || error.code === 'ECONNRESET' || error.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') {
      handleDisconnect(); // Reconnect on connection loss or fatal error
    } else {
      throw error;
    }
  });
}

handleDisconnect();

server.listen(7000, function check(error) {
  if (error) {
      console.log("Error!");
  } else {
      console.log("Started port 7000");
  }
});

// acc
server.post("/api/acc/add", (req, res) => {
  const { username, password, email, name, isAdmin } = req.body;

  // Check if the username already exists
  const checkUserSql = "SELECT * FROM acc WHERE username = ?";
  db.query(checkUserSql, [username], (error, results) => {
    if (error) {
      return res.status(500).send({ status: false, message: "Database error" });
    }

    if (results.length > 0) {
      const existingUser = results[0];
      if (existingUser.isAdmin === 0) {
        return res.send({ status: false, message: "Account is still not approved by developers or Username already taken" });
      } else if (existingUser.isAdmin === 1) {
        return res.send({ status: false, message: "Account Username is already used" });
      } else {
        return res.send({ status: false, message: "Username already taken" });
      }
    }

    // Hash the password before storing it in the database
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) {
        return res.status(500).send({ status: false, message: "Error hashing password" });
      }

      let acc = {
        username: username,
        password: hash, 
        email: email,
        name: name,
        isAdmin: isAdmin || 0 // Default to 0 if isAdmin is not provided
      };

      let sql = "INSERT INTO acc SET ?";
      db.query(sql, acc, (error) => {
          if (error) {
              res.send({ status: false, message: "Account creation failed", error: error });
          } else {
              res.send({ status: true, message: "Account created successfully" });
          }
      });
    });
  });
});

server.get("/api/acc", (req, res) => {
  var sql = "SELECT * FROM acc";
  db.query(sql, function (error, result) {
      if (error) {
          console.log("Error connecting to tbl acc1");
      } else {
          res.send({ status: true, data: result });
      }
  });
});

server.get("/api/acc/login", (req, res) => {
  const { username, password } = req.query;

  console.log(`Login attempt for username: ${username}`);

  const sql = "SELECT * FROM acc WHERE username = ?";
  db.query(sql, [username], (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).send({ status: false, message: "Database error" });
    }

    if (results.length === 0) {
      console.log("User not found");
      return res.status(404).send({ status: false, message: "Account doesn't exist" });
    }

    const user = results[0];
    console.log(`User found: ${JSON.stringify(user)}`);

    // Compare the hashed password
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error("Error comparing passwords:", err);
        return res.status(500).send({ status: false, message: "Error comparing passwords" });
      }

      console.log(`Password match: ${isMatch}`);

      if (isMatch) {
        if (user.isAdmin === 1) {
          console.log("Login successful");
          res.send({ status: true, message: "Login successful", userId: user.userid, isAdmin: user.isAdmin });
        } else {
          console.log("Account is not yet approved by the developers");
          res.send({ status: false, message: "Account is not yet approved by the developers." });
        }
      } else {
        console.log("Incorrect credentials");
        res.status(401).send({ status: false, message: "Incorrect credentials" });
      }
    });
  });
});


// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
server.put("/api/survey_answers/update_by_email/:email", (req, res) => {
  const email = req.params.email;
  const {
    name,
    contact_Num,
    program,
    occupation,
    civil_Status,
    sex,
    work_Status,
    work_place,
    salary,
    firstjob_curriculum,
    batchYr
  } = req.body;

  const sql = `
    UPDATE survey_answers SET
      name = ?,
      contact_Num = ?,
      program = ?,
      occupation = ?,
      civil_Status = ?,
      sex = ?,
      work_Status = ?,
      work_place = ?,
      salary = ?,
      firstjob_curriculum = ?,
      batchYr = ?
    WHERE email = ?
  `;

  db.query(sql, [
    name,
    contact_Num,
    program,
    occupation,
    civil_Status,
    sex,
    work_Status,
    work_place,
    salary,
    firstjob_curriculum,
    batchYr,
    email
  ], (error, results) => {
    if (error) {
      console.error('Error updating survey answers:', error);
      res.status(500).send({ status: false, message: "Failed to update data" });
    } else {
      res.send({ status: true, message: "Data updated successfully." });
    }
  });
});


server.get("/api/survey_answers/check_email/:email", (req, res) => {
  const email = req.params.email;
  const sql = "SELECT COUNT(*) as count FROM survey_answers WHERE email = ?";
  db.query(sql, [email], (error, results) => {
    if (error) {
      console.error('Error checking email existence:', error);
      res.status(500).send({ status: false, message: "Database error" });
    } else {
      const emailExists = results[0].count > 0;
      res.send(emailExists);
    }
  });
});


server.post("/api/survey_answers/add", (req, res) => {
  const { name, email, contact_Num, program, occupation, civil_Status, sex, work_Status, work_place, salary, firstjob_curriculum, batchYr } = req.body;

  let surveyAnswerDetails = {
    name,
    email,
    contact_Num,
    program,
    occupation,
    civil_Status,
    sex,
    work_Status,
    work_place,
    salary,
    firstjob_curriculum,
    batchYr
  };

  let sql = "INSERT INTO survey_answers SET ?";
  db.query(sql, surveyAnswerDetails, (error) => {
    if (error) {
      res.send({ status: false, message: "Survey answer creation failed", error });
    } else {
      res.send({ status: true, message: "Survey answer created successfully" });
    }
  });
});


// Get all students from the database without filtering by isAdmin
server.get("/api/survey_answers", (req, res) => {
  var sql = "SELECT * FROM survey_answers";
  db.query(sql, function (error, result) {
      if (error) {
          console.log("Error connecting to tbl student");
          res.send({ status: false, message: "Error fetching data" });
      } else {
          res.send({ status: true, data: result });
      }
  });
});

app.get("/api/survey_answers", (req, res) => {
  var sql = "SELECT company, program, name, email, contact_Num, work_Status FROM survey_answers";
  db.query(sql, function (error, result) {
    if (error) {
      console.log("Error connecting to tbl survey_answers");
      res.send({ status: false, message: "Error fetching data" });
    } else {
      res.send({ status: true, data: result });
    }
  });
});

// Get a specific student by id with matching isAdmin in acc
server.get("/api/survey_answers/:id", (req, res) => {
  var studentid = req.params.id;
  var sql = "SELECT student.* FROM student JOIN acc ON student.isAdmin = acc.isAdmin WHERE student.id =" + studentid;
  db.query(sql, function (error, result) {
      if (error) {
          console.log("Error connecting to tbl student");
          res.send({ status: false, message: "Error fetching data" });
      } else {
          res.send({ status: true, data: result });
      }
  });
});

server.put("/api/survey_answers/update/:id", (req, res) => {
  let sql = 
      "UPDATE student SET name='" +
      req.body.name +
      "' , email= '" +
      req.body.email +
      "UPDATE student SET contact_Num='" +
      req.body.contact_Num+
      "' , program= '" +
      req.body.program +
      "UPDATE student SET occupation='" +
      req.body.occupation +
      "UPDATE student SET civil_Status='" +
      req.body.civil_Status +
      "UPDATE student SET sex='" +
      req.body.sex +
      "UPDATE student SET work_Status='" +
      req.body.work_Status +
      "UPDATE student SET company='" +
      req.body.salary +
      "UPDATE student SET salary='" +
      req.body.company +
      "' WHERE id=" +
      req.params.id;

  let a = db.query(sql, (error, result) => {
      if (error) {
          res.send({ status: false, message: "Failed to update data" });
      } else {
          res.send({ status: true, message: "Data updated successfully." });
      }
  });
});

server.delete("/api/survey_answers/delete/:id", (req, res) => {
  let sql = "DELETE FROM survey_answers WHERE id = ?";
  db.query(sql, [req.params.id], (error, results) => {
    if (error) {
      console.error('Error deleting student:', error);
      res.status(500).send({ status: false, message: "Failed to delete data" });
    } else {
      console.log(`Deleted ${results.affectedRows} row(s)`);
      res.send({ status: true, message: "Successfully deleted the data" });
    }
  });
});

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Add multiple students to alumni_list
server.post("/api/alumni_list/add-multiple", (req, res) => {
  const students = req.body;

  if (!Array.isArray(students) || students.length === 0) {
    return res.status(400).send({ status: false, message: "Invalid input data" });
  }

  let sql = "INSERT INTO alumni_list (Course, student_name, email, contact) VALUES ?";
  let values = students.map(student => [student.Course, student.student_name, student.email, student.contact]);

  db.query(sql, [values], (error, results) => {
    if (error) {
      console.error('Error adding students:', error);
      res.status(500).send({ status: false, message: "Failed to add students", error });
    } else {
      console.log(`Added ${results.affectedRows} students`);
      res.send({ status: true, message: "Students added successfully" });
    }
  });
});
// add singular data
server.post("/api/alumni_list/add", (req, res) => {
  const { Course, student_name, email, contact} = req.body;

  let studentDetails = {
    Course,
    student_name,
    email,
    contact,
  };

  let sql = "INSERT INTO alumni_list SET ?";
  db.query(sql, studentDetails, (error) => {
    if (error) {
      res.send({ status: false, message: "Student creation failed", error });
    } else {
      res.send({ status: true, message: "Student created successfully" });
    }
  });
});



server.get("/api/alumni_list", (req, res) => {
  var sql = "SELECT * FROM alumni_list";
  db.query(sql, function (error, result) {
      if (error) {
          console.log("Error connecting to tbl student");
          res.send({ status: false, message: "Error fetching data" });
      } else {
          res.send({ status: true, data: result });
      }
  });
});

// Update student in alumni_list
server.put("/api/alumni_list/update/:id", (req, res) => {
  const { id } = req.params;
  const { Course, student_name, email, contact } = req.body;

  let sql = "UPDATE alumni_list SET Course = ?, student_name = ?, email = ?, contact = ? WHERE id = ?";
  db.query(sql, [Course, student_name, email, contact, id], (error, results) => {
    if (error) {
      console.error('Error updating student:', error);
      res.status(500).send({ status: false, message: "Failed to update data" });
    } else {
      console.log(`Updated ${results.affectedRows} row(s)`);
      res.send({ status: true, message: "Student updated successfully" });
    }
  });
});

// Delete student from alumni_list
server.delete("/api/alumni_list/delete/:id", (req, res) => {
  let sql = "DELETE FROM alumni_list WHERE id = ?";
  db.query(sql, [req.params.id], (error, results) => {
    if (error) {
      console.error('Error deleting student:', error);
      res.status(500).send({ status: false, message: "Failed to delete data" });
    } else {
      console.log(`Deleted ${results.affectedRows} row(s)`);
      res.send({ status: true, message: "Successfully deleted the data" });
    }
  });
});

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Middleware
app.use(bodyParser.json());

// Endpoint for sending emails
app.post('/send-email', (req, res) => {
  const { subject, body, to } = req.body;

  if (!subject || !body || !to) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'fitnezzgo@gmail.com', // Replace with your Gmail email address
      pass: 'meowmelol' // Replace with your Gmail password
    }
  });

  // Email options
  const mailOptions = {
    from: 'fitnezzgo@gmail.com', // Replace with your Gmail email address
    to,
    subject,
    text: body
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ message: 'Failed to send email' });
    } else {
      console.log('Email sent:', info.response);
      return res.status(200).json({ message: 'Email sent successfully' });
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

let isAdminGlobal = false; // Variable to store isAdmin status

server.post('/api/admin-status', (req, res) => {
  isAdminGlobal = req.body.isAdmin;
  res.send({ status: true, message: 'Admin status updated successfully' });
});

// New login endpoint
server.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT * FROM acc WHERE username = ?";
  db.query(sql, [username], (error, results) => {
    if (error) {
      return res.status(500).send({ status: false, message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).send({ status: false, message: "User not found" });
    }

    const user = results[0];

    // Compare the hashed password
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).send({ status: false, message: "Error comparing passwords" });
      }

      if (isMatch) {
        res.send({ status: true, message: "Login successful", userId: user.userid, isAdmin: user.isAdmin });
      } else {
        res.status(401).send({ status: false, message: "Incorrect credentials" });
      }
    });
  });
});
