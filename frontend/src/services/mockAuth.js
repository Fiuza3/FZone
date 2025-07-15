// Serviço de autenticação mockado para desenvolvimento
const mockUsers = [
  {
    id: '1',
    name: 'Administrador',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    department: 'admin',
    permissions: {
      events: true,
      tasks: true,
      stock: true,
      finance: true,
      hr: true,
      accounts: true
    }
  },
  {
    id: '2',
    name: 'Gerente',
    email: 'manager@example.com',
    password: 'manager123',
    role: 'manager',
    department: 'events',
    permissions: {
      events: true,
      tasks: true,
      stock: true,
      finance: false,
      hr: false,
      accounts: false
    }
  }
];

// Login mockado
export const login = async (email, password) => {
  console.log('🔐 Usando autenticação mockada para desenvolvimento');
  
  // Simula delay de rede
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Encontra usuário
  const user = mockUsers.find(u => u.email === email);
  
  if (!user || user.password !== password) {
    throw new Error('Credenciais inválidas');
  }
  
  // Cria token simulado
  const token = `mock-jwt-${Math.random().toString(36).substring(2)}`;
  
  // Remove senha antes de retornar
  const { password: _, ...userWithoutPassword } = user;
  
  return {
    success: true,
    user: userWithoutPassword,
    token
  };
};

// Registro mockado
export const register = async (userData) => {
  console.log('🔐 Usando registro mockado para desenvolvimento');
  
  // Simula delay de rede
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Verifica se email já existe
  if (mockUsers.some(u => u.email === userData.email)) {
    throw new Error('Email já cadastrado');
  }
  
  // Cria novo usuário
  const newUser = {
    id: Math.random().toString(36).substring(2),
    name: userData.name,
    email: userData.email,
    role: 'admin',
    department: 'admin',
    permissions: {
      events: true,
      tasks: true,
      stock: true,
      finance: true,
      hr: true,
      accounts: true
    }
  };
  
  // Cria token simulado
  const token = `mock-jwt-${Math.random().toString(36).substring(2)}`;
  
  return {
    success: true,
    user: newUser,
    token
  };
};

export default { login, register };