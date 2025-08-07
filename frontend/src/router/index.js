import { createRouter, createWebHistory } from 'vue-router';

// Importação de componentes de autenticação
const Login = () => import('../views/Login.vue');
const Register = () => import('../views/Register.vue');

// Importação de componentes principais
const Dashboard = () => import('../views/Dashboard.vue');
const NotFound = () => import('../views/NotFound.vue');

// Importação de componentes de módulos
const AcceptInvite = () => import('../views/AcceptInvite.vue');
const AccountsList = () => import('../views/accounts/AccountsList.vue');
const CalendarView = () => import('../views/calendar/CalendarView.vue');
const CompanySettings = () => import('../views/CompanySettings.vue');
const EmployeeForm = () => import('../views/hr/EmployeeForm.vue');
const EmployeeList = () => import('../views/hr/EmployeeList.vue');
const EventForm = () => import('../views/events/EventForm.vue');
const EventList = () => import('../views/events/EventList.vue');
const FinanceForm = () => import('../views/finance/FinanceForm.vue');
const FinanceList = () => import('../views/finance/FinanceList.vue');
const FinanceProjection = () => import('../views/finance/FinanceProjection.vue');
const FinanceReport = () => import('../views/finance/FinanceReport.vue');
const PayrollReport = () => import('../views/hr/PayrollReport.vue');
const StockForm = () => import('../views/stock/StockForm.vue');
const StockList = () => import('../views/stock/StockList.vue');
const StockReport = () => import('../views/stock/StockReport.vue');
const TaskForm = () => import('../views/tasks/TaskForm.vue');
const TaskList = () => import('../views/tasks/TaskList.vue');

// Função para verificar autenticação
const requireAuth = (to, from, next) => {
  const token = localStorage.getItem('token');

  if (!token) {
    console.log('🔒 Acesso negado: Usuário não autenticado');
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else {
    console.log('✅ Usuário autenticado, permitindo acesso');
    next();
  }
};

// Função para verificar permissões de módulo
const requirePermission = (module) => {
  return (to, from, next) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
      next({ name: 'Login', query: { redirect: to.fullPath } });
      return;
    }

    // Admin e Owner têm acesso a tudo
    if (user.role === 'owner' || user.role === 'admin') {
      next();
      return;
    }

    if (!user.permissions || !user.permissions[module]) {
      console.log(`❌ Acesso negado: Sem permissão para ${module}`);
      next({ name: 'Dashboard' });
      return;
    }

    next();
  };
};

// Função para verificar se é admin
const requireAdmin = (to, from, next) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
    return;
  }

  if (user.role !== 'owner' && user.role !== 'admin') {
    console.log('❌ Acesso negado: Não é administrador');
    next({ name: 'Dashboard' });
    return;
  }

  next();
};

// Função para verificar se já está autenticado
const redirectIfAuth = (to, from, next) => {
  const token = localStorage.getItem('token');

  if (token) {
    console.log('🔄 Usuário já autenticado, redirecionando para dashboard');
    next({ name: 'Dashboard' });
  } else {
    next();
  }
};

// Configuração das rotas
const routes = [
  // Rotas públicas
  {
    path: '/login',
    name: 'Login',
    component: Login,
    beforeEnter: redirectIfAuth
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    beforeEnter: redirectIfAuth
  },
  {
    path: '/accept-invite/:token',
    name: 'AcceptInvite',
    component: AcceptInvite,
    beforeEnter: redirectIfAuth
  },

  // Rotas protegidas
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    beforeEnter: requireAuth
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/company-settings',
    name: 'CompanySettings',
    component: CompanySettings,
    beforeEnter: requireAuth
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: CalendarView,
    beforeEnter: requireAuth
  },
  {
    path: '/help',
    name: 'Help',
    component: () => import('../views/Help.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('../views/Notifications.vue'),
    beforeEnter: requireAuth
  },

  // Rotas de tarefas
  {
    path: '/tasks',
    name: 'TaskList',
    component: TaskList,
    beforeEnter: requireAuth
  },
  {
    path: '/tasks/new',
    name: 'NewTask',
    component: TaskForm,
    beforeEnter: requireAuth
  },
  {
    path: '/tasks/:id/edit',
    name: 'EditTask',
    component: TaskForm,
    props: true,
    beforeEnter: requireAuth
  },

  // Rotas de estoque
  {
    path: '/stock',
    name: 'StockList',
    component: StockList,
    beforeEnter: requirePermission('stock')
  },
  {
    path: '/stock/new',
    name: 'NewProduct',
    component: StockForm,
    beforeEnter: requirePermission('stock')
  },
  {
    path: '/stock/:id/edit',
    name: 'EditProduct',
    component: StockForm,
    props: true,
    beforeEnter: requirePermission('stock')
  },
  {
    path: '/stock/report',
    name: 'StockReport',
    component: StockReport,
    beforeEnter: requirePermission('stock')
  },

  // Rotas financeiras
  {
    path: '/finance',
    name: 'FinanceList',
    component: FinanceList,
    beforeEnter: requirePermission('finance')
  },
  {
    path: '/finance/new',
    name: 'NewTransaction',
    component: FinanceForm,
    beforeEnter: requirePermission('finance')
  },
  {
    path: '/finance/:id/edit',
    name: 'EditTransaction',
    component: FinanceForm,
    props: true,
    beforeEnter: requirePermission('finance')
  },
  {
    path: '/finance/report',
    name: 'FinanceReport',
    component: FinanceReport,
    beforeEnter: requirePermission('finance')
  },
  {
    path: '/finance/projection',
    name: 'FinanceProjection',
    component: FinanceProjection,
    beforeEnter: requirePermission('finance')
  },

  // Rotas de RH
  {
    path: '/hr',
    name: 'EmployeeList',
    component: EmployeeList,
    beforeEnter: requirePermission('hr')
  },
  {
    path: '/hr/new',
    name: 'NewEmployee',
    component: EmployeeForm,
    beforeEnter: requirePermission('hr')
  },
  {
    path: '/hr/:id/edit',
    name: 'EditEmployee',
    component: EmployeeForm,
    props: true,
    beforeEnter: requirePermission('hr')
  },
  {
    path: '/hr/payroll',
    name: 'PayrollReport',
    component: PayrollReport,
    beforeEnter: requirePermission('hr')
  },

  // Rotas de Eventos
  {
    path: '/events',
    name: 'EventList',
    component: EventList,
    beforeEnter: requireAuth
  },
  {
    path: '/events/new',
    name: 'NewEvent',
    component: EventForm,
    beforeEnter: requireAuth
  },
  {
    path: '/events/:id/edit',
    name: 'EditEvent',
    component: EventForm,
    beforeEnter: requireAuth
  },

  // Rotas de Contas
  {
    path: '/accounts',
    name: 'AccountsList',
    component: AccountsList,
    beforeEnter: requireAdmin
  },

  // Rota 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
];

// Criação do router
const router = createRouter({
  history: createWebHistory(),
  routes
});

// Log de navegação
router.beforeEach((to, from) => {
  console.log(`🧭 Navegando de ${from.path} para ${to.path}`);
});

export default router;