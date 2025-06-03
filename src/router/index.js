import { createRouter, createWebHistory } from "vue-router";
import LoginPage from '@/views/LoginPage.vue';
import LogoutPage from "@/views/LogoutPage.vue";
import ProfilePage from "@/views/UserProfile.vue"
import { getCurrentUser } from "../api/auth";

const routes = [
    {
        path: '/',
        redirect: '/login'
    },

    {
        path: '/login',
        name: 'Login',
        component: LoginPage
    }, 

    {
        path: '/logout',
        name: 'Logout',
        component: LogoutPage
    },

    {
        path: '/me',
        name: 'Me',
        component: ProfilePage,
        meta: { requiresAuth: true } // require login to visit
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach(async (to, from, next) => {
    // if the route no need to login, let it pass
    if ( !to.meta.requiresAuth) {
        return next();
    }

    try {
        await getCurrentUser();
        next();
    } catch(error) {
        console.warn('Not authenticated or session expired:', error);
        // not logined or token invalid, jump to login page
        next('/login');
    }
});

export default router;