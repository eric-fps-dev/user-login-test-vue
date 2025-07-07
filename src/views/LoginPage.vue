<template>
    <div class="login-wrapper">
        <div class="login-container">
            <h2>Login</h2>

            <div v-if="!stepVerified">
                <input v-model="username" placeholder="Username" />

                <div class="password-field">
                    <input
                    :type="passwordVisible ? 'text' : 'password'"
                    v-model="password"
                    placeholder="Password"
                    />
                    <button type="button" @click="togglePasswordVisibility" class="toggle-btn">
                    {{ passwordVisible ? "Password Invisible" : "Password Visible" }}
                    </button>
                </div>

                <button
                    @click="handleVerifyCredentials"
                    :disabled="!username || !password || loading"
                >
                    {{ loading ? 'Verifying...' : 'Verify Credentials' }}
                </button>
            </div>

            <div v-if="stepVerified && !stepSmsSent">
                <label for="countryCode">Country Code:</label>
                <select v-model="countryCode" id ="countryCode">
                    <option v-for="code in countryCodeOptions" :key="code.value" :value="code.value">
                        {{ code.label }}
                    </option>
                </select>

                <input v-model="phoneNumber" placeholder="Phone Number" readonly />

                <button
                @click="handleSendSMSCode"
                :disabled="loading"
                >
                    {{ loading ? 'Sending...' : 'Send SMS Code' }}
                </button>
            </div>

            <div v-if="stepSmsSent">
                <input v-model="verificationCode" placeholder="Enter verification Code" />
                <button 
                    @click="handleLogin"
                    :disabled="!isValidVerificationCode || loading"
                    >
                        {{ loading ? 'Logging in...' : 'Login' }}
                </button> 
            </div>
            
            <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
        </div>
    </div>
</template>

<script>
import { 
    verifyCredentials,
    sendSMSCode,
    loginWithCode
} from '@/api/auth';

export default {
    data() {
        return {
            username: '',
            password: '',
            countryCode: '+1',
            phoneNumber: '',
            verificationCode: '',
            authToken: '',
            stepVerified: false,
            stepSmsSent: false,
            errorMessage: '',
            loading: false,
            passwordVisible: false,

            countryCodeOptions: [
                {label: '+1 (US/Canada)', value: '+1'},
                { label: '+86 (China)', value: '+86' },
                { label: '+852 (HK)', value: '+852' },
                { label: '+81 (Japan)', value: '+81' },
                { label: '+49 (Germany)', value: '+49' },
                { label: '+44 (UK)', value: '+44' },
                { label: '+33 (France)', value: '+33' }
            ]
        };
    },
    computed: {
        isValidVerificationCode() {
            return /^\d{6}$/.test(this.verificationCode); 
        }
    },
    methods: {

        togglePasswordVisibility() {
            this.passwordVisible = !this.passwordVisible;
        },

        async handleVerifyCredentials() {
            this.loading = true;
            try {
                const res = await verifyCredentials(this.username, this.password);
                console.log('Verify Credentials response Data: ', res.data)
                const data = res.data.data;
                this.authToken = data.auth_token;
                this.phoneNumber = data.phone_number;
                this.countryCode = data.country_code;
                this.stepVerified = true;
                this.errorMessage = '';
            } catch (error) {
                this.errorMessage = error.response?.data?.message || 'Credential verification failed';
            } finally {
                this.loading = false;
            }
        },

        async handleSendSMSCode() {
            this.loading = true;
            try {
                await sendSMSCode(this.username, this.countryCode, this.phoneNumber, this.authToken);
                console.log('SMS send request sent.')

                this.stepSmsSent = true;
                this.errorMessage = ''
            } catch (error) {
                this.errorMessage = error.response?.data?.message || 'SMS sending failed';
            } finally {
                this.loading = false;
            }
        },

        async handleLogin() {
            this.loading = true;
            try {
                const { ip, deviceId } = await this.collectLoginInfo();
                const res = await loginWithCode(
                    this.username,
                    this.countryCode,
                    this.phoneNumber,
                    this.verificationCode,
                    ip,
                    deviceId
                );
                console.log('Login With Code response Data: ', res.data)

                const data = res.data.data

                alert('Login success! Welcome');
                this.$router.push('/ws-test'); 
                this.errorMessage = '';
            } catch (error) {
                this.errorMessage = error.response?.data?.message || 'Login failed';
            } finally {
                this.loading = false;
            }
        },

        async collectLoginInfo() {
            const ip = await this.getPublicIP();
            const deviceId = this.getDeviceFingerprint();
            return { ip, deviceId };
        },

        async getPublicIP() {
            try {
                const res = await fetch('https://api64.ipify.org?format=json')
                const data = await res.json();
                return data.ip;
            } catch (error) {
                console.error('Failed to fetch IP: ', error);
                return 'unknown'
            }
        },

        getDeviceFingerprint() {
            return navigator.userAgent;
        }
    }

    
};
</script>
