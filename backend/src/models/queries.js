const { query } = require("../config/database");

module.exports = {
  query,

  // ==================== USER QUERIES ====================
  async findUserByEmail(email) {
    const users = await query("SELECT * FROM users WHERE email = $1", [email]);
    return users[0];
  },

  async findUserById(id) {
    const users = await query("SELECT * FROM users WHERE id = $1", [id]);
    return users[0];
  },

  async createUser(userData) {
    const { name, email, password, role, class_id, section_id } = userData;
    const result = await query(
      "INSERT INTO users (name, email, password, role, class_id, section_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [name, email, password, role, class_id, section_id]
    );
    return result[0];
  },

  async getAllUsers() {
    return await query(`
      SELECT u.id, u.name, u.email, u.role, u.class_id, u.section_id, u.created_at, 
             c.name as class_name, s.name as section_name, s.display_name as section_display_name
      FROM users u 
      LEFT JOIN classes c ON u.class_id = c.id 
      LEFT JOIN sections s ON u.section_id = s.id 
      ORDER BY u.created_at DESC
    `);
  },

  async updateUser(id, userData) {
    const { name, email, role, class_id, section_id } = userData;
    const result = await query(
      "UPDATE users SET name = $1, email = $2, role = $3, class_id = $4, section_id = $5 WHERE id = $6 RETURNING *",
      [name, email, role, class_id, section_id, id]
    );
    return result[0];
  },

  async deleteUser(id) {
    const result = await query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
    return result[0];
  },

  // ==================== CLASS QUERIES ====================
  async getAllClasses() {
    return await query("SELECT * FROM classes ORDER BY name");
  },

  async getClassById(id) {
    const classes = await query("SELECT * FROM classes WHERE id = $1", [id]);
    return classes[0];
  },

  async createClass(name) {
    const result = await query(
      "INSERT INTO classes (name) VALUES ($1) RETURNING *",
      [name]
    );
    return result[0];
  },

  async deleteClass(id) {
    const result = await query("DELETE FROM classes WHERE id = $1 RETURNING *", [id]);
    return result[0];
  },

  // ==================== SECTION QUERIES ====================
  async getAllSections() {
    return await query(`
      SELECT s.*, c.name as class_name 
      FROM sections s 
      JOIN classes c ON s.class_id = c.id 
      ORDER BY c.name, s.name
    `);
  },

  async getSectionsByClass(classId) {
    return await query(
      "SELECT * FROM sections WHERE class_id = $1 ORDER BY name",
      [classId]
    );
  },

  async getSectionById(id) {
    const sections = await query("SELECT * FROM sections WHERE id = $1", [id]);
    return sections[0];
  },

  async createSection(sectionData) {
    const { class_id, name, display_name } = sectionData;
    const result = await query(
      "INSERT INTO sections (class_id, name, display_name) VALUES ($1, $2, $3) RETURNING *",
      [class_id, name, display_name || `Section ${name}`]
    );
    return result[0];
  },

  async updateSection(id, sectionData) {
    const { name, display_name } = sectionData;
    const result = await query(
      "UPDATE sections SET name = $1, display_name = $2 WHERE id = $3 RETURNING *",
      [name, display_name, id]
    );
    return result[0];
  },

  async deleteSection(id) {
    const result = await query("DELETE FROM sections WHERE id = $1 RETURNING *", [id]);
    return result[0];
  },

  // ==================== NOTICE QUERIES ====================
  async getAllNotices() {
    const notices = await query(`
      SELECT n.*, u.name as sender_name, u.role as sender_role
      FROM notices n 
      JOIN users u ON n.sent_by = u.id 
      ORDER BY n.created_at DESC
    `);

    // Get recipients and attachments for each notice
    for (let notice of notices) {
      notice.recipients = await this.getNoticeRecipients(notice.id);
      notice.attachments = await this.getNoticeAttachments(notice.id);
    }

    return notices;
  },

  async getNoticeById(id) {
    const notices = await query(
      `
      SELECT n.*, u.name as sender_name, u.role as sender_role
      FROM notices n 
      JOIN users u ON n.sent_by = u.id 
      WHERE n.id = $1
    `,
      [id]
    );

    if (notices.length === 0) return null;

    const notice = notices[0];
    notice.recipients = await this.getNoticeRecipients(notice.id);
    notice.attachments = await this.getNoticeAttachments(notice.id);

    return notice;
  },

  async createNotice(noticeData) {
    const { title, message, notice_type, sent_by } = noticeData;
    const result = await query(
      "INSERT INTO notices (title, message, notice_type, sent_by) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, message, notice_type, sent_by]
    );
    return result[0];
  },

  async updateNotice(id, noticeData) {
    const { title, message, notice_type } = noticeData;
    const result = await query(
      "UPDATE notices SET title = $1, message = $2, notice_type = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *",
      [title, message, notice_type, id]
    );
    return result[0];
  },

  async deleteNotice(id) {
    const result = await query("DELETE FROM notices WHERE id = $1 RETURNING *", [id]);
    return result[0];
  },

  // ==================== NOTICE RECIPIENTS QUERIES ====================
  async addNoticeRecipient(noticeId, recipientData) {
    const { class_id, section_id } = recipientData;
    const result = await query(
      "INSERT INTO notice_recipients (notice_id, class_id, section_id) VALUES ($1, $2, $3) RETURNING *",
      [noticeId, class_id, section_id]
    );
    return result[0];
  },

  async getNoticeRecipients(noticeId) {
    return await query(
      `
      SELECT nr.*, c.name as class_name, s.name as section_name, s.display_name as section_display_name
      FROM notice_recipients nr
      LEFT JOIN classes c ON nr.class_id = c.id
      LEFT JOIN sections s ON nr.section_id = s.id
      WHERE nr.notice_id = $1
    `,
      [noticeId]
    );
  },

  async deleteNoticeRecipients(noticeId) {
    await query("DELETE FROM notice_recipients WHERE notice_id = $1", [noticeId]);
  },

  // ==================== NOTICE ATTACHMENTS QUERIES ====================
  async addNoticeAttachment(attachmentData) {
    const { notice_id, filename, original_filename, file_path, file_type, file_size } = attachmentData;
    const result = await query(
      "INSERT INTO notice_attachments (notice_id, filename, original_filename, file_path, file_type, file_size) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [notice_id, filename, original_filename, file_path, file_type, file_size]
    );
    return result[0];
  },

  async getNoticeAttachments(noticeId) {
    return await query(
      "SELECT * FROM notice_attachments WHERE notice_id = $1 ORDER BY created_at",
      [noticeId]
    );
  },

  async deleteNoticeAttachment(id) {
    const result = await query("DELETE FROM notice_attachments WHERE id = $1 RETURNING *", [id]);
    return result[0];
  },

  async deleteNoticeAttachments(noticeId) {
    const result = await query("DELETE FROM notice_attachments WHERE notice_id = $1 RETURNING *", [noticeId]);
    return result;
  },

  // ==================== FACULTY-CLASS ASSIGNMENT QUERIES ====================
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

  // ==================== FACULTY-SECTION ASSIGNMENT QUERIES ====================
  async assignFacultyToSection(faculty_id, section_id) {
    const result = await query(
      "INSERT INTO faculty_sections (faculty_id, section_id) VALUES ($1, $2) RETURNING *",
      [faculty_id, section_id]
    );
    return result[0];
  },

  async removeFacultyFromSection(faculty_id, section_id) {
    const result = await query(
      "DELETE FROM faculty_sections WHERE faculty_id = $1 AND section_id = $2 RETURNING *",
      [faculty_id, section_id]
    );
    return result[0];
  },

  async getFacultySections(faculty_id) {
    return await query(
      `
      SELECT s.*, c.name as class_name 
      FROM sections s
      JOIN faculty_sections fs ON s.id = fs.section_id
      JOIN classes c ON s.class_id = c.id
      WHERE fs.faculty_id = $1
      ORDER BY c.name, s.name
    `,
      [faculty_id]
    );
  },

  // ==================== STUDENT NOTICES ====================
  async getStudentNotices(userId) {
    // Get user's class and section
    const user = await this.findUserById(userId);
    if (!user) return [];

    const notices = await query(
      `
      SELECT DISTINCT n.*, u.name as sender_name, u.role as sender_role
      FROM notices n 
      JOIN users u ON n.sent_by = u.id 
      WHERE n.notice_type = 'ALL'
         OR (n.notice_type = 'CLASS' AND n.id IN (
           SELECT notice_id FROM notice_recipients WHERE class_id = $1
         ))
         OR (n.notice_type = 'SECTION' AND n.id IN (
           SELECT notice_id FROM notice_recipients WHERE section_id = $2
         ))
      ORDER BY n.created_at DESC
    `,
      [user.class_id, user.section_id]
    );

    // Get recipients and attachments for each notice
    for (let notice of notices) {
      notice.recipients = await this.getNoticeRecipients(notice.id);
      notice.attachments = await this.getNoticeAttachments(notice.id);
    }

    return notices;
  },

  // ==================== FACULTY NOTICES ====================
  async getFacultyNotices(faculty_id) {
    // Get faculty's classes and sections
    const facultyClasses = await this.getFacultyClasses(faculty_id);
    const facultySections = await this.getFacultySections(faculty_id);

    const classIds = facultyClasses.map((c) => c.id);
    const sectionIds = facultySections.map((s) => s.id);

    let query_text = `
      SELECT DISTINCT n.*, u.name as sender_name, u.role as sender_role
      FROM notices n 
      JOIN users u ON n.sent_by = u.id 
      WHERE n.notice_type = 'ALL' 
         OR n.notice_type = 'FACULTY'
    `;

    const params = [faculty_id];

    if (classIds.length > 0) {
      query_text += ` OR (n.notice_type = 'CLASS' AND n.id IN (
        SELECT notice_id FROM notice_recipients WHERE class_id = ANY($2)
      ))`;
      params.push(classIds);
    }

    if (sectionIds.length > 0) {
      const sectionParamIndex = classIds.length > 0 ? 3 : 2;
      query_text += ` OR (n.notice_type = 'SECTION' AND n.id IN (
        SELECT notice_id FROM notice_recipients WHERE section_id = ANY($${sectionParamIndex})
      ))`;
      params.push(sectionIds);
    }

    query_text += ` ORDER BY n.created_at DESC`;

    const notices = await this.query(query_text, params);

    // Get recipients and attachments for each notice
    for (let notice of notices) {
      notice.recipients = await this.getNoticeRecipients(notice.id);
      notice.attachments = await this.getNoticeAttachments(notice.id);
    }

    return notices;
  },

  // ==================== STATISTICS QUERIES ====================
  async getUserStats() {
    const [admin, faculty, student] = await Promise.all([
      query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'"),
      query("SELECT COUNT(*) as count FROM users WHERE role = 'faculty'"),
      query("SELECT COUNT(*) as count FROM users WHERE role = 'student'"),
    ]);

    return {
      admin: parseInt(admin[0].count),
      faculty: parseInt(faculty[0].count),
      student: parseInt(student[0].count),
    };
  },

  async getNoticeStats() {
    const [total, all, faculty, class_notices, section_notices] = await Promise.all([
      query("SELECT COUNT(*) as count FROM notices"),
      query("SELECT COUNT(*) as count FROM notices WHERE notice_type = 'ALL'"),
      query("SELECT COUNT(*) as count FROM notices WHERE notice_type = 'FACULTY'"),
      query("SELECT COUNT(*) as count FROM notices WHERE notice_type = 'CLASS'"),
      query("SELECT COUNT(*) as count FROM notices WHERE notice_type = 'SECTION'"),
    ]);

    return {
      total: parseInt(total[0].count),
      all: parseInt(all[0].count),
      faculty: parseInt(faculty[0].count),
      class: parseInt(class_notices[0].count),
      section: parseInt(section_notices[0].count),
    };
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
};