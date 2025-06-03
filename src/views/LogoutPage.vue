<template>
    <div class="login-wrapper">
        <div class="login-container">
            <h2>Welcome!</h2>
            <p>Your Are Successfully Logged In.</p>
            <button @click="handleLogout">Logout</button>
        </div>
    </div>
</template>


<script>
import { logout } from '@/api/auth';

export default {
    methods: {
        async handleLogout() {
            try {
                await logout();
                console.log('Logout successfully.');
            } catch (error) {
                console.warn('Logout API failed:', error?.response?.data || error.message);
            }
             this.$router.push('/login');
        }
    }
}
</script>
