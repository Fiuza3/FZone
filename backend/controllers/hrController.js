const Employee = require('../models/Employee');

// Listar funcionários
const getEmployees = async (req, res) => {
  console.log('👥 Solicitação para listar funcionários');
  
  try {
    const { department, status } = req.query;
    let filter = {};
    
    if (department) filter.department = department;
    if (status) filter.status = status;
    
    console.log('🔍 Filtros aplicados:', filter);
    
    const employees = await Employee.find(filter).sort({ name: 1 });
    console.log(`📋 ${employees.length} funcionários encontrados`);
    
    // Adiciona campo virtual de tempo de serviço
    const employeesWithVirtuals = employees.map(emp => ({
      ...emp.toObject(),
      yearsOfService: emp.yearsOfService
    }));
    
    res.json(employeesWithVirtuals);
    
  } catch (error) {
    console.error('❌ Erro ao buscar funcionários:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar funcionários',
      details: error.message
    });
  }
};

// Criar novo funcionário
const createEmployee = async (req, res) => {
  console.log('➕ Cadastrando novo funcionário');
  
  try {
    const employeeData = req.body;
    console.log('📝 Dados do funcionário:', { 
      name: employeeData.name, 
      position: employeeData.position,
      department: employeeData.department
    });
    
    const employee = new Employee(employeeData);
    await employee.save();
    
    console.log('✅ Funcionário cadastrado:', employee.name);
    
    res.status(201).json({
      message: 'Funcionário cadastrado com sucesso',
      employee: {
        ...employee.toObject(),
        yearsOfService: employee.yearsOfService
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao cadastrar funcionário:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        error: `${field === 'email' ? 'Email' : 'CPF'} já cadastrado`,
        code: 'DUPLICATE_FIELD'
      });
    }
    
    res.status(500).json({ 
      error: 'Erro ao cadastrar funcionário',
      details: error.message
    });
  }
};

// Atualizar funcionário
const updateEmployee = async (req, res) => {
  console.log('✏️ Atualizando funcionário ID:', req.params.id);
  
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!employee) {
      console.log('❌ Funcionário não encontrado');
      return res.status(404).json({ 
        error: 'Funcionário não encontrado'
      });
    }
    
    console.log('✅ Funcionário atualizado:', employee.name);
    
    res.json({
      message: 'Funcionário atualizado com sucesso',
      employee: {
        ...employee.toObject(),
        yearsOfService: employee.yearsOfService
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar funcionário:', error);
    res.status(500).json({ 
      error: 'Erro ao atualizar funcionário',
      details: error.message
    });
  }
};

// Desativar funcionário (não deletar)
const deactivateEmployee = async (req, res) => {
  console.log('🚫 Desativando funcionário ID:', req.params.id);
  
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { status: 'inativo' },
      { new: true }
    );
    
    if (!employee) {
      return res.status(404).json({ 
        error: 'Funcionário não encontrado'
      });
    }
    
    console.log('✅ Funcionário desativado:', employee.name);
    
    res.json({
      message: 'Funcionário desativado com sucesso',
      employee
    });
    
  } catch (error) {
    console.error('❌ Erro ao desativar funcionário:', error);
    res.status(500).json({ 
      error: 'Erro ao desativar funcionário',
      details: error.message
    });
  }
};

// Relatório de folha de pagamento
const getPayrollReport = async (req, res) => {
  console.log('💰 Gerando relatório de folha de pagamento');
  
  try {
    const report = await Employee.getPayrollReport();
    
    // Calcula totais gerais
    const totals = report.reduce((acc, dept) => {
      acc.totalEmployees += dept.totalEmployees;
      acc.totalSalary += dept.totalSalary;
      return acc;
    }, { totalEmployees: 0, totalSalary: 0 });
    
    console.log('📊 Relatório gerado:', {
      departments: report.length,
      totalEmployees: totals.totalEmployees,
      totalSalary: totals.totalSalary.toFixed(2)
    });
    
    res.json({
      departmentBreakdown: report,
      totals: {
        ...totals,
        avgSalaryCompany: totals.totalEmployees > 0 ? totals.totalSalary / totals.totalEmployees : 0
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error);
    res.status(500).json({ 
      error: 'Erro ao gerar relatório',
      details: error.message
    });
  }
};

// Relatório de aniversariantes do mês
const getBirthdayReport = async (req, res) => {
  console.log('🎂 Gerando relatório de aniversariantes');
  
  try {
    const currentMonth = new Date().getMonth() + 1;
    
    // Como não temos campo de aniversário, vamos usar a data de contratação como exemplo
    const employees = await Employee.find({ status: 'ativo' });
    
    const hireAnniversaries = employees.filter(emp => {
      const hireMonth = new Date(emp.hireDate).getMonth() + 1;
      return hireMonth === currentMonth;
    }).map(emp => ({
      name: emp.name,
      position: emp.position,
      department: emp.department,
      hireDate: emp.hireDate,
      yearsOfService: emp.yearsOfService
    }));
    
    console.log(`🎉 ${hireAnniversaries.length} aniversários de contratação este mês`);
    
    res.json({
      month: currentMonth,
      hireAnniversaries
    });
    
  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error);
    res.status(500).json({ 
      error: 'Erro ao gerar relatório',
      details: error.message
    });
  }
};

module.exports = {
  getEmployees,
  createEmployee,
  updateEmployee,
  deactivateEmployee,
  getPayrollReport,
  getBirthdayReport
};