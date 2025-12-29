const { 
  createNotice,
  updateNotice,
  deleteNotice,
  getFacultyNotices,
  getFacultyClasses,
  getAllClasses,
  getAllUsers
} = require('../models/queries');

const getDashboard = async (req, res) => {
  try {
    const [myNotices, myClasses, allStudents] = await Promise.all([
      getFacultyNotices(req.user.id),
      getFacultyClasses(req.user.id),
      getAllUsers()
    ]);

    const students = allStudents.filter(user => user.role === 'student');

    res.json({
      myNotices: myNotices.length,
      myClasses: myClasses.length,
      totalStudents: students.length
    });
  } catch (error) {
    console.error('Faculty dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getNotices = async (req, res) => {
  try {
    const notices = await getFacultyNotices(req.user.id);
    res.json({ notices });
  } catch (error) {
    console.error('Get faculty notices error:', error);
    res.status(500).json({ error: error.message });
  }
};

const createNoticeController = async (req, res) => {
  try {
    const { title, message, notice_type, class_id } = req.body;
    
    // Validate that faculty can only send notices to their assigned classes
    if (notice_type === 'CLASS') {
      const facultyClasses = await getFacultyClasses(req.user.id);
      const hasAccess = facultyClasses.some(cls => cls.id === class_id);
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'You can only send notices to your assigned classes' });
      }
    }
    
    const notice = await createNotice({
      title,
      message,
      notice_type,
      class_id: notice_type === 'CLASS' ? class_id : null,
      sent_by: req.user.id
    });

    res.status(201).json({
      message: 'Notice created successfully',
      notice
    });
  } catch (error) {
    console.error('Create faculty notice error:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateNoticeController = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, notice_type, class_id } = req.body;
    
    // First check if the notice exists and was created by this faculty
    const { getNoticeById } = require('../models/queries');
    const existingNotice = await getNoticeById(id);
    
    if (!existingNotice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    if (existingNotice.sent_by !== req.user.id) {
      return res.status(403).json({ error: 'You can only update your own notices' });
    }

    // Validate class access for CLASS notices
    if (notice_type === 'CLASS') {
      const facultyClasses = await getFacultyClasses(req.user.id);
      const hasAccess = facultyClasses.some(cls => cls.id === class_id);
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'You can only send notices to your assigned classes' });
      }
    }

    const notice = await updateNotice(id, {
      title,
      message,
      notice_type,
      class_id: notice_type === 'CLASS' ? class_id : null
    });

    res.json({
      message: 'Notice updated successfully',
      notice
    });
  } catch (error) {
    console.error('Update faculty notice error:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteNoticeController = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First check if the notice exists and was created by this faculty
    const { getNoticeById } = require('../models/queries');
    const existingNotice = await getNoticeById(id);
    
    if (!existingNotice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    if (existingNotice.sent_by !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own notices' });
    }

    const notice = await deleteNotice(id);
    
    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Delete faculty notice error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getStudents = async (req, res) => {
  try {
    const allUsers = await getAllUsers();
    const students = allUsers.filter(user => user.role === 'student');
    res.json({ students });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getMyClasses = async (req, res) => {
  try {
    const classes = await getFacultyClasses(req.user.id);
    res.json({ classes });
  } catch (error) {
    console.error('Get faculty classes error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getAllClassesController = async (req, res) => {
  try {
    const classes = await getAllClasses();
    res.json({ classes });
  } catch (error) {
    console.error('Get all classes error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDashboard,
  getNotices,
  createNotice: createNoticeController,
  updateNotice: updateNoticeController,
  deleteNotice: deleteNoticeController,
  getStudents,
  getMyClasses,
  getAllClasses: getAllClassesController
};
