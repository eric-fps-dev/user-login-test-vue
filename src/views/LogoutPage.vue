<template>
    <div class="login-wrapper">
        <div class="login-container">
            <h2>You have safely logged out.</h2>
            <p>Returning to the login page...</p>
            <p v-if="logoutRes">
                <span style="color:#888;font-size:0.96em;">Logout Result:</span>
                <pre style="font-size:0.97em;">{{ logoutRes | pretty }}</pre>
            </p>
        </div>
    </div>
</template>


<script>
import { logout } from '@/api/auth';

export default {
    mounted() {
    const resStr = window.localStorage.getItem('lastLogoutRes');
    if (resStr) {
      this.logoutRes = JSON.parse(resStr);
      window.localStorage.removeItem('lastLogoutRes');
    }
    setTimeout(() => {
      this.$router.push('/');
    }, 1800);
  }
}
</script>
