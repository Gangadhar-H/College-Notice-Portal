const { query } = require("../config/database");

module.exports = {
  query,

  // User queries
  async findUserByEmail(email) {
    const users = await query("SELECT * FROM users WHERE email = $1", [email]);
    return users[0];
  },

  async findUserById(id) {
    const users = await query("SELECT * FROM users WHERE id = $1", [id]);
    return users[0];
  },

  async createUser(userData) {
    const { name, email, password, role, class_id } = userData;
    const result = await query(
      "INSERT INTO users (name, email, password, role, class_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, email, password, role, class_id]
    );
    return result[0];
  },

  async getAllUsers() {
    return await query(`
    SELECT u.id, u.name, u.email, u.role, u.class_id, u.created_at, c.name as class_name 
    FROM users u 
    LEFT JOIN classes c ON u.class_id = c.id 
    ORDER BY u.created_at DESC
  `);
  },

  async updateUser(id, userData) {
    const { name, email, role, class_id } = userData;
    const result = await query(
      "UPDATE users SET name = $1, email = $2, role = $3, class_id = $4 WHERE id = $5 RETURNING *",
      [name, email, role, class_id, id]
    );
    return result[0];
  },

  async deleteUser(id) {
    const result = await query("DELETE FROM users WHERE id = $1 RETURNING *", [
      id,
    ]);
    return result[0];
  },

  // Class queries
  async getAllClasses() {
    return await query("SELECT * FROM classes ORDER BY name");
  },

  async createClass(name) {
    const result = await query(
      "INSERT INTO classes (name) VALUES ($1) RETURNING *",
      [name]
    );
    return result[0];
  },

  async deleteClass(id) {
    const result = await query(
      "DELETE FROM classes WHERE id = $1 RETURNING *",
      [id]
    );
    return result[0];
  },

  // Notice queries
  async getAllNotices() {
    return await query(`
      SELECT n.*, u.name as sender_name, u.role as sender_role, c.name as class_name 
      FROM notices n 
      JOIN users u ON n.sent_by = u.id 
      LEFT JOIN classes c ON n.class_id = c.id 
      ORDER BY n.created_at DESC
    `);
  },

  async getNoticeById(id) {
    const notices = await query(
      `
      SELECT n.*, u.name as sender_name, u.role as sender_role, c.name as class_name 
      FROM notices n 
      JOIN users u ON n.sent_by = u.id 
      LEFT JOIN classes c ON n.class_id = c.id 
      WHERE n.id = $1
    `,
      [id]
    );
    return notices[0];
  },

  async createNotice(noticeData) {
    const { title, message, notice_type, class_id, sent_by } = noticeData;
    const result = await query(
      "INSERT INTO notices (title, message, notice_type, class_id, sent_by) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [title, message, notice_type, class_id, sent_by]
    );
    return result[0];
  },

  async updateNotice(id, noticeData) {
    const { title, message, notice_type, class_id } = noticeData;
    const result = await query(
      "UPDATE notices SET title = $1, message = $2, notice_type = $3, class_id = $4 WHERE id = $5 RETURNING *",
      [title, message, notice_type, class_id, id]
    );
    return result[0];
  },

  async deleteNotice(id) {
    const result = await query(
      "DELETE FROM notices WHERE id = $1 RETURNING *",
      [id]
    );
    return result[0];
  },

  // Faculty-Class assignment queries
  async assignFacultyToClass(faculty_id, class_id) {
    const result = await query(
      "INSERT INTO faculty_classes (faculty_id, class_id) VALUES ($1, $2) RETURNING *",
      [faculty_id, class_id]
    );
    return result[0];
  },

  async removeFacultyFromClass(faculty_id, class_id) {
    const result = await query(
      "DELETE FROM faculty_classes WHERE faculty_id = $1 AND class_id = $2 RETURNING *",
      [faculty_id, class_id]
    );
    return result[0];
  },

  async getFacultyClasses(faculty_id) {
    return await query(
      `
      SELECT c.* 
      FROM classes c 
      JOIN faculty_classes fc ON c.id = fc.class_id 
      WHERE fc.faculty_id = $1
    `,
      [faculty_id]
    );
  },

  async getFacultyByClass(class_id) {
    return await query(
      `
      SELECT u.* 
      FROM users u 
      JOIN faculty_classes fc ON u.id = fc.faculty_id 
      WHERE fc.class_id = $1
    `,
      [class_id]
    );
  },

  // Student notices (for their class and ALL notices)
  async getStudentNotices(class_id) {
    return await query(
      `
      SELECT n.*, u.name as sender_name, u.role as sender_role, c.name as class_name 
      FROM notices n 
      JOIN users u ON n.sent_by = u.id 
      LEFT JOIN classes c ON n.class_id = c.id 
      WHERE n.notice_type = 'ALL' OR (n.notice_type = 'CLASS' AND n.class_id = $1)
      ORDER BY n.created_at DESC
    `,
      [class_id]
    );
  },

  // Faculty notices (ALL, FACULTY, and their assigned classes)
  async getFacultyNotices(faculty_id) {
    return await query(
      `
      SELECT n.*, u.name as sender_name, u.role as sender_role, c.name as class_name 
      FROM notices n 
      JOIN users u ON n.sent_by = u.id 
      LEFT JOIN classes c ON n.class_id = c.id 
      WHERE n.notice_type = 'ALL' 
         OR n.notice_type = 'FACULTY' 
         OR (n.notice_type = 'CLASS' AND n.class_id IN (
           SELECT fc.class_id FROM faculty_classes fc WHERE fc.faculty_id = $1
         ))
      ORDER BY n.created_at DESC
    `,
      [faculty_id]
    );
  },

  // Statistics queries
  async getUserStats() {
    const [admin, faculty, student] = await Promise.all([
      query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'"),
      query("SELECT COUNT(*) as count FROM users WHERE role = 'faculty'"),
      query("SELECT COUNT(*) as count FROM users WHERE role = 'student'"),
    ]);

    return {
      admin: admin[0].count,
      faculty: faculty[0].count,
      student: student[0].count,
    };
  },

  async getNoticeStats() {
    const [total, all, faculty, class_notices] = await Promise.all([
      query("SELECT COUNT(*) as count FROM notices"),
      query("SELECT COUNT(*) as count FROM notices WHERE notice_type = 'ALL'"),
      query(
        "SELECT COUNT(*) as count FROM notices WHERE notice_type = 'FACULTY'"
      ),
      query(
        "SELECT COUNT(*) as count FROM notices WHERE notice_type = 'CLASS'"
      ),
    ]);

    return {
      total: total[0].count,
      all: all[0].count,
      faculty: faculty[0].count,
      class: class_notices[0].count,
    };
  },
};
