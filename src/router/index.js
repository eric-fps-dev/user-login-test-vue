import { createRouter, createWebHistory } from "vue-router";
import CallbackPage from '@/views/Callback.vue';    
import LogoutPage from "@/views/LogoutPage.vue";
import ProfilePage from "@/views/UserProfile.vue"
import WebSocketTestPage from "@/views/WebSocketTest.vue";
import { getCurrentUser } from "../api/auth";
import { gotoCognitoLogin } from '@/utils/cognito';

const routes = [
    {
        path: '/',
        redirect: '/ws-test'
    },

    {
        path: '/callback',
        name: 'Callback',
        component: CallbackPage
    },

    {
        path: '/logout-success',
        name: 'LogoutSuccess',
        component: LogoutPage,
        meta: { requiresAuth: false } 
    },

    {
        path: '/me',
        name: 'Me',
        component: ProfilePage,
        meta: { requiresAuth: true } // require login to visit
    },

    {
        path: '/ws-test',
        name: 'WebSocketTest',
        component: WebSocketTestPage,
        meta: { requiresAuth: true }
      }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach(async (to, from, next) => {
    // if the route no need to login, let it pass
/*     console.log("Router beforeEach:", to.path, "requiresAuth?", to.meta.requiresAuth);
 */
    if (!to.meta.requiresAuth) {
        return next();
    }
    try {
        await getCurrentUser();
        next();
    } catch(error) {
        console.warn('Not authenticated, will gotoCognitoLogin()', error);
        // not logined or token invalid, jump to Cognito page
        gotoCognitoLogin();
    }
});

export default router;