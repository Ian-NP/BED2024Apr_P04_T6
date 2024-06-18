const Admin = require("../models/admin");

const getAllAdminUsers = async (req, res) => {
  try {
    const admins = await Admin.getAllAdminUsers();
    res.json(admins);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving admin users");
  }
};

const getAdminById = async (req, res) => {
  const adminId = parseInt(req.params.id);
  try {
    const admin = await Admin.getAdminById(adminId);
    if (!admin) {
      return res.status(404).send("Admin not found");
    }
    res.json(admin);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving admin user");
  }
};

const createAdminUser = async (req, res) => {
    const newAdmin = req.body;
    try {
      const createdAdminUser = await Admin.createAdminUser(newAdmin);
      res.status(201).json(createdAdminUser);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error creating admin");
    }
  };

  const updateAdminUser = async (req, res) => {
    const adminId = parseInt(req.params.id);
    const newAdminData = req.body;
  
    try {
      const updatedAdmin = await Admin.updateAdminUser(adminId, newAdminData);
      if (!updatedAdmin) {
        return res.status(404).send("Admin not found");
      }
      res.json(updatedAdmin);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error updating admin");
    }
  };
  
  const deleteAdminUser = async (req, res) => {
    const adminId = parseInt(req.params.id);
  
    try {
      const success = await Admin.deleteAdminUser(adminId);
      if (!success) {
        return res.status(404).send("Admin not found");
      }
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).send("Error deleting admin");
    }
  };

module.exports = {
  getAllAdminUsers,
  getAdminById,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
};