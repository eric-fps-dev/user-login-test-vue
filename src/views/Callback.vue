<template>
    <div class="callback-wrapper">
        <div class="callback-container">
            <h2>Login callback process</h2>

            <div v-if="loading">
                <p>Verifying Cognito login. Please wait...</p>
            </div>

            <div v-else-if="error">
                <p class="error-text">{{ errorMsg }}</p>
                <button @click="retry" :disabled="loading">Retry</button>
                <button @click="goHome" style="margin-left: 1rem;">Back Homepage</button>
            </div>

            <div v-else>
                <p>Login successful! Redirecting to the main page...</p>
            </div>
        </div>
    </div>
</template>


<script>
import { callback } from '@/api/auth'

export default {
    data() {
        return {
            loading: true,
            error: false,
            errorMsg: ''
        }
    },
    methods: {
        async doCallback() {
            const code = this.$route.query.code
            if (!code) {
                this.error = true
                this.loading = false
                this.errorMsg = 'No Cognito login code was detected. Automatically redirected to the home page.'
                setTimeout(this.goHome, 1800)
                return
            }
            try {
                await callback(code)
                this.loading = false
                this.error = false
                setTimeout(() => {
                    this.$router.replace('/ws-test')
                }, 1000)
                localStorage.removeItem('cognito-logout');
            } catch (err) {
                this.loading = false
                this.error = true
                this.errorMsg = err?.response?.data?.message || 'Login callback failed. Please try again or contact the administrator.'
            }   
        },
        retry() {
            this.loading = true
            this.error = false
            this.errorMsg = ''
            this.doCallback()
        },
        goHome() {
            this.$router.replace('/ws-test')
        }
    },
    mounted() {
        this.doCallback()
    }
}
</script>

<style scoped>
.callback-wrapper {
    min-height: 70vh;
    display: flex;
    align-items: center;
    justify-content: center;
}
.callback-container {
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 12px #eee;
    padding: 2rem 2.5rem;
    min-width: 300px;
    max-width: 400px;
    text-align: center;
}
.error-text {
    color: #e74c3c;
    margin-bottom: 1rem;
}
</style>