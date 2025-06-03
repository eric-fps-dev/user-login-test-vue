<template>
    <div class="login-wrapper">
        <div class="profile-wrapper" v-if="user">
            <div class="avatar-wrapper">
                <img :src="user.image_path || defaultAvatar" alt ="User Avatar" class="avatar-img" />
                <h2>{{ user.first_name }} {{ user.last_name }}</h2>
                <p class="username">@{{ user.username }}</p>
            </div>
            <div class="info-section">
                <p><strong>ID:</strong> {{ user.id }}</p>
                <p><strong>Email:</strong> {{ user.email }}</p>
                <p><strong>Phone Number:</strong> {{ user.phone_number }}</p>
                <p><strong>Gender:</strong> {{ user.gender }}</p>
                <p><strong>Status:</strong> {{ user.status }}</p>
                <p><strong>Roles:</strong></p>
                <ul>
                    <li v-for="role in user.roles" :key="role.id">
                        {{ role.name }} - {{ role.description }}
                        <ul>
                            <li v-for="perm in role.permissions" :key="perm.id">
                                {{ perm.name }} - {{ perm.description }}
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
                
            <div class="logout-section">
                <button @click="handleLogout">Logout</button>
            </div>

            <div class="refresh-section">
                <button @click="handelRefresh">Refresh</button>
            </div>
        </div>
                
        <div class="loading-wrapper" v-else>
            <p>Loading user info ...</p>
        </div>
        </div>
</template>

<script>

import { getCurrentUser } from '@/api/auth';
import { logout, refresh } from '@/api/auth';

export default {
    name: 'UserProfile',
    data() {
        return {
            user: null,
            loading: true,
            defaultAvatar: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fsignalvnoise.com%2Fposts%2F3104-behind-the-scenes-reinventing-our-default-profile-pictures&psig=AOvVaw2qc5fTTilg8s9cRpmkTQuI&ust=1748988646892000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCMDThsvg040DFQAAAAAdAAAAABAE'
        };
    },
    async mounted() {
        try {
            const res = await getCurrentUser();
            this.user = res.data.data;
            console.log('Get current user profile successfully.');
        } catch (error) {
            console.error('Failed to fetch current user:', error);
        }
    },
    methods: {
        async handleLogout() {
            try {
                await logout();
                console.log('Logout successfully.');
            } catch (error) {
                console.error('Logout API failed:', error?.response?.data || error.message);
            } finally {
                this.$router.push('/login');
            }
        },

        async handelRefresh() {
            try {
                await refresh();
                console.log('Refresh successfully.');
            } catch (error) {
                console.error('Refresh API failed:', error?.response?.data || error.message);
            }
        }
    }
};

</script>

<style scoped>
.profile-wrapper {
  max-width: 700px;
  margin: 2rem auto;
  padding: 2rem;
  background: #f7f9fc;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.avatar-section {
  margin-bottom: 1.5rem;
}

.avatar-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ddd;
  margin-bottom: 0.5rem;
}

.username {
  color: #888;
  font-size: 0.95rem;
}

.info-section {
  text-align: left;
  margin-top: 1rem;
}

.logout-section .refresh-section{
  margin-top: 2rem;
}

.logout-section button {
  background-color: #dc3545;
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.refresh-section button {
  background-color: #3538dc;
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.logout-section button:hover {
  background-color: #c82333;
}

.loading-wrapper .refresh-section {
  text-align: center;
  margin-top: 3rem;
  font-size: 1.2rem;
}

</style>