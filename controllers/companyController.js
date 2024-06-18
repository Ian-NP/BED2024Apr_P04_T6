const CompanyUser = require("../models/company");

const getAllCompanyUsers = async (req, res) => {
  try {
    const companyUsers = await CompanyUser.getAllCompanyUsers();
    res.json(companyUsers);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving company users");
  }
};

const getCompanyById = async (req, res) => {
  const companyId = parseInt(req.params.id);
  try {
    const company = await CompanyUser.getCompanyById(companyId);
    if (!company) {
      return res.status(404).send("Company not found");
    }
    res.json(company);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving company");
  }
};

const createCompanyUser = async (req, res) => {
    const newCompanyUser = req.body;
    try {
      const createdCompanyUser = await CompanyUser.createCompanyUser(newCompanyUser);
      res.status(201).json(createdCompanyUser);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error creating company user");
    }
  };

  const updateCompanyUser = async (req, res) => {
    const companyId = parseInt(req.params.id);
    const newCompanyUserData = req.body;
  
    try {
      const updatedCompanyUser = await CompanyUser.updateCompanyUser(companyId, newCompanyUserData);
      if (!updatedCompanyUser) {
        return res.status(404).send("Company not found");
      }
      res.json(updatedCompanyUser);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error updating company");
    }
  };
  
  const deleteCompanyUser = async (req, res) => {
    const companyId = parseInt(req.params.id);
  
    try {
      const success = await CompanyUser.deleteCompanyUser(companyId);
      if (!success) {
        return res.status(404).send("Company not found");
      }
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).send("Error deleting company user");
    }
  };

module.exports = {
  getAllCompanyUsers,
  getCompanyById,
  createCompanyUser,
  updateCompanyUser,
  deleteCompanyUser,
};