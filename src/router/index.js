import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/components/Home';
import Contact from '@/components/Contact';
import NotFound from '@/components/NotFound';
import MyProfile from '@/components/MyProfile';
import ActivateAccount from '@/components/ActivateAccount';
import ResetPassword from '@/components/ResetPassword';
import TestComponent from '@/components/TestComponent';
import SignFromMobile from '@/components/SignFromMobile';
import QRCodeScanner from '@/components/QRCodeScanner';
import NotAllowed from '@/components/NotAllowed';
import AssessmentCentre from '@/components/AssessmentCentre';
import MyBookings from '@/components/MyBookings';
import DSA from '@/components/DSA';
import Dashboard from '@/components/Dashboard';
import PublicAuth from '@/components/PublicAuth';
import ACSettings from '@/components/ACSettings';
import ACCalendar from '@/components/ACCalendar';
import ACCustomers from '@/components/ACCustomers';
import ACServices from '@/components/ACServices';
import ACUsers from '@/components/ACUsers';
import ACForms from '@/components/ACForms';

import store from '../store';

Vue.use(Router);

const routes = [
  {
    path: '*',
    name: 'NotFound',
    component: NotFound,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/',
    name: 'Index',
    component: Home,
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/dsa/:dsa_slug/:action/:parameter?/:id?',
    name: 'DSA',
    component: DSA,
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/contact',
    name: 'Contact',
    component: Contact
  },
  {
    path: '/my-profile',
    name: 'MyProfile',
    component: MyProfile,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/activate-account/:token',
    name: 'ActivateAccount',
    component: ActivateAccount,
    meta: {
      requiresAnon: true
    }
  },
  {
    path: '/reset-password/:token',
    name: 'ResetPassword',
    component: ResetPassword,
    meta: {
      requiresAnon: true
    }
  },
  {
    path: '/test',
    name: 'Test',
    component: TestComponent
  },
  {
    path: '/sign-from-mobile/:random_code',
    name: 'SignFromMobile',
    component: SignFromMobile,
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/qrscan',
    name: 'QRCodeScanner',
    component: QRCodeScanner,
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/not-allowed',
    name: 'NotAllowed',
    component: NotAllowed,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/assessment-centre/:slug/:action/:token?',
    name: 'AssessmentCentre',
    component: AssessmentCentre
  },
  {
    path: '/assessment-centre/calendar',
    name: 'ACCalendar',
    component: ACCalendar,
    meta: {
      requiresAuth: true,
      roles: ['ac', 'na']
    }
  },
  {
    path: '/assessment-centre/customers',
    name: 'ACCustomers',
    component: ACCustomers,
    meta: {
      requiresAuth: true,
      roles: ['ac']
    }
  },
  {
    path: '/assessment-centre/services',
    name: 'ACServices',
    component: ACServices,
    meta: {
      requiresAuth: true,
      roles: ['ac']
    }
  },
  {
    path: '/assessment-centre/users',
    name: 'ACUsers',
    component: ACUsers,
    meta: {
      requiresAuth: true,
      roles: ['ac']
    }
  },
  {
    path: '/assessment-centre/ac-forms',
    name: 'ACForms',
    component: ACForms,
    meta: {
      requiresAuth: true,
      roles: ['ac']
    }
  },
  {
    path: '/assessment-centre/settings',
    name: 'ACSettings',
    component: ACSettings,
    meta: {
      requiresAuth: true,
      roles: ['ac', 'na']
    }
  },
  {
    path: '/my-bookings',
    name: 'MyBookings',
    component: MyBookings
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/auth/:action',
    name: 'PublicAuth',
    component: PublicAuth,
    meta: {
      requiresAnon: true
    }
  }
];

var router = new Router({
  routes
});

router.beforeEach((to, from, next) => {
  var payload = store._modules.root._rawModule.state.payload;
  if (to.meta.requiresAuth) {
    if (payload.is_guest) {
      store._modules.root._rawModule.state.authRouteRequested = to.path;
      //next('/login');
    } else if (to.meta.hasOwnProperty('roles')) {
      var found = false;
      for (var i in to.meta.roles) {
        if (payload.roles.includes(to.meta.roles[i])) {
          found = true;
          break;
        }
      }
      if (found) {
        next();
      } else {
        next('/not-allowed');
      }
    } else {
      next();
    }
  } else if (to.meta.requiresAnon) {
    if (!payload.is_guest) {
      next('/');
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
