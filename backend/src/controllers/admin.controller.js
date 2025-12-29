const { 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser,
  getAllNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  getAllClasses,
  createClass,
  deleteClass,
  assignFacultyToClass,
  removeFacultyFromClass,
  getUserStats,
  getNoticeStats
} = require('../models/queries');

const getDashboard = async (req, res) => {
  try {
    const [userStats, noticeStats, totalClasses] = await Promise.all([
      getUserStats(),
      getNoticeStats(),
      getAllClasses()
    ]);

    res.json({
      users: userStats,
      notices: noticeStats,
      totalClasses: totalClasses.length
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: error.message });
  }
};

const createUserController = async (req, res) => {
  try {
    const { name, email, password, role, class_id } = req.body;
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      role,
      class_id: role === 'student' ? class_id : null
    });

    // Don't send password
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, class_id } = req.body;
    
    const user = await updateUser(id, {
      name,
      email,
      role,
      class_id: role === 'student' ? class_id : null
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't send password
    const { password, ...userWithoutPassword } = user;

    res.json({
      message: 'User updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteUserController = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await deleteUser(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getAllNoticesController = async (req, res) => {
  try {
    const notices = await getAllNotices();
    res.json({ notices });
  } catch (error) {
    console.error('Get notices error:', error);
    res.status(500).json({ error: error.message });
  }
};

const createNoticeController = async (req, res) => {
  try {
    const { title, message, notice_type, class_id } = req.body;
    
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
    console.error('Create notice error:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateNoticeController = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, notice_type, class_id } = req.body;
    
    const notice = await updateNotice(id, {
      title,
      message,
      notice_type,
      class_id: notice_type === 'CLASS' ? class_id : null
    });

    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    res.json({
      message: 'Notice updated successfully',
      notice
    });
  } catch (error) {
    console.error('Update notice error:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteNoticeController = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notice = await deleteNotice(id);
    
    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Delete notice error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getAllClassesController = async (req, res) => {
  try {
    const classes = await getAllClasses();
    res.json({ classes });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ error: error.message });
  }
};

const createClassController = async (req, res) => {
  try {
    const { name } = req.body;
    
    const classObj = await createClass(name);

    res.status(201).json({
      message: 'Class created successfully',
      class: classObj
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteClassController = async (req, res) => {
  try {
    const { id } = req.params;
    
    const classObj = await deleteClass(id);
    
    if (!classObj) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({ error: error.message });
  }
};

const assignFacultyToClassController = async (req, res) => {
  try {
    const { faculty_id, class_id } = req.body;
    
    const assignment = await assignFacultyToClass(faculty_id, class_id);

    res.status(201).json({
      message: 'Faculty assigned to class successfully',
      assignment
    });
  } catch (error) {
    console.error('Assign faculty error:', error);
    res.status(500).json({ error: error.message });
  }
};

const removeFacultyFromClassController = async (req, res) => {
  try {
    const { faculty_id, class_id } = req.body;
    
    const assignment = await removeFacultyFromClass(faculty_id, class_id);
    
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json({ message: 'Faculty removed from class successfully' });
  } catch (error) {
    console.error('Remove faculty error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDashboard,
  getAllUsers: getAllUsersController,
  createUser: createUserController,
  updateUser: updateUserController,
  deleteUser: deleteUserController,
  getAllNotices: getAllNoticesController,
  createNotice: createNoticeController,
  updateNotice: updateNoticeController,
  deleteNotice: deleteNoticeController,
  getAllClasses: getAllClassesController,
  createClass: createClassController,
  deleteClass: deleteClassController,
  assignFacultyToClass: assignFacultyToClassController,
  removeFacultyFromClass: removeFacultyFromClassController
};
