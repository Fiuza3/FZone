const Company = require('../models/Company');
const User = require('../models/User');

// Criar nova empresa
const createCompany = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const company = new Company({
      name,
      slug,
      email,
      phone,
      address,
      owner: req.user._id
    });
    
    await company.save();
    
    // Atualiza o usuário para ser owner da empresa
    await User.findByIdAndUpdate(req.user._id, {
      company: company._id,
      role: 'owner',
      permissions: {
        tasks: true,
        stock: true,
        finance: true,
        hr: true
      }
    });
    
    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obter dados da empresa
const getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.user.company).populate('owner', 'name email');
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createCompany,
  getCompany
};