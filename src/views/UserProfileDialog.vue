<template>
  <div class="profile-dialog-backdrop" @click.self="close">
    <div class="profile-dialog">
      <button class="close-btn" @click="close">×</button>
      <div class="profile-header">
        <h3>User Info</h3>
      </div>
      <div v-if="user" class="profile-main">
        <img :src="user.image_path || defaultAvatar" class="avatar-img" />
        <h4>
          {{ user.first_name }} {{ user.last_name }}
          <span class="username">@{{ user.username }}</span>
        </h4>
        <p><strong>ID:</strong> {{ user.id }}</p>
        <p><strong>Employee #:</strong> {{ user.employee_number }}</p>
        <p><strong>Title:</strong> {{ user.title }}</p>
        <p><strong>Department:</strong> {{ user.department_id }}</p>
        <p v-if="user.supervisor_id"><strong>Supervisor:</strong> {{ user.supervisor_id }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>Phone:</strong> {{ user.phone_number }}</p>
        <p><strong>Gender:</strong> {{ user.gender }}</p>
        <p>
          <strong>Status:</strong>
          <span :style="{color: user.status === 1 ? '#28a745' : '#c9302c'}">
            {{ user.status === 1 ? "Active" : "Inactive" }}
          </span>
        </p>
        <p>
          <strong>Verified:</strong>
          <span :style="{color: user.is_verified ? '#28a745' : '#c9302c'}">
            {{ user.is_verified ? "Yes" : "No" }}
          </span>
        </p>
        <p>
          <strong>Enabled:</strong>
          <span :style="{color: user.enabled ? '#28a745' : '#c9302c'}">
            {{ user.enabled ? "Yes" : "No" }}
          </span>
        </p>
        <p><strong>Roles:</strong></p>
        <ul class="roles-list">
          <li v-for="role in user.roles" :key="role.id">
            <span>{{ role.name }}</span>
            <span v-if="role.description" style="color:#888;font-size:0.96em;"> ({{ role.description }})</span>
            <ul>
              <li v-for="perm in role.permissions" :key="perm.id">
                <span>{{ perm.name }}</span>
                <span v-if="perm.description" style="color:#888;font-size:0.94em;"> — {{ perm.description }}</span>
                <span v-if="perm.permission_type" style="color:#3a87ad;font-size:0.94em; margin-left:6px;">
                  [{{ perm.permission_type.name }}]
                </span>
              </li>
            </ul>
          </li>
        </ul>
        <p style="margin-top:1.6rem; color:#999;font-size:0.95em;">
          <span>Created: {{ user.created_at && user.created_at.slice(0,19).replace('T',' ') }}</span>
          <span v-if="user.updated_at"> | Updated: {{ user.updated_at && user.updated_at.slice(0,19).replace('T',' ') }}</span>
        </p>
      </div>
      <div v-else style="margin: 2rem 0;">
        <span>Loading…</span>
      </div>
      <button @click="handleLogout" class="logout-btn">Logout</button>
    </div>
  </div>
</template>
  
<script>
  import { getCurrentUser, logout } from '@/api/auth';
import { gotoCognitoLogin } from '../utils/cognito';
  
  export default {
    name: 'UserProfileDialog',
    data() {
      return {
        user: null,
        defaultAvatar: 'https://cdn-icons-png.flaticon.com/512/847/847969.png'
      };
    },
    async mounted() {
      try {
        const res = await getCurrentUser();
        this.user = res.data.data;
      } catch (error) {
        // 这里可以弹出通知
        this.user = null;
      }
    },
    methods: {
      close() {
        this.$emit('close');
      },
      async handleLogout() {
        try {
          const res = await logout();
          console.log('logout url:', res.data.data.logoutUrl);

          if (res.data && res.data.data && res.data.data.logoutUrl) {

            setTimeout(() => {
              window.location.href = res.data.data.logoutUrl;
            }, 2000);

            try {
              localStorage.setItem('cognito-logout', Date.now());
              console.log('localStorage写入成功');
            } catch (e) {
              console.error('localStorage写入异常:', e);
            }

          } else {
            this.$router.push('/logout-success');
          }
        } catch (e) {
          this.$router.push('/logout-success');
        }
        this.$emit('logout');
      }
    }
  }
</script>
  
<style scoped>
.profile-dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(30,40,60,0.18);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.profile-dialog {
  background: #fff;
  border-radius: 20px;
  min-width: 480px;
  max-width: 540px;
  width: 100%;
  box-shadow: 0 8px 36px rgba(0,0,0,0.13);
  padding: 2.5rem 2.5rem 2.1rem 2.5rem;
  position: relative;
  text-align: left;
  /* 新增以下两行 */
  max-height: 88vh;      /* 不超出视口，顶部预留空间 */
  overflow-y: auto;      /* 内容超出时滚动 */
}

.close-btn {
  position: absolute;
  right: 22px;
  top: 14px;
  background: none;
  border: none;
  font-size: 2rem;
  color: #999;
  cursor: pointer;
  transition: color 0.16s;
  z-index: 10;
  line-height: 1;
  padding: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.close-btn:focus,
.close-btn:focus-visible {
  outline: none;
  box-shadow: none;
}
.close-btn:hover {
  color: #d9534f;
}
.profile-header {
  margin-bottom: 1.2rem;
}
.profile-header h3 {
  margin: 0 0 1.2rem 0;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  text-align: left;
}
.profile-main {
  margin-bottom: 1.5rem;
  text-align: left;
}
.avatar-img {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 2px solid #eee;
  display: block;
  margin: 0 0 1.2rem 0;
}
h4 {
  margin: 0 0 0.8rem 0;
  font-size: 1.15rem;
  font-weight: 600;
  text-align: left;
}
.username {
  color: #888;
  font-weight: 400;
  margin-left: 0.4em;
  font-size: 1rem;
}
p {
  margin: 0.25rem 0;
  font-size: 1.08rem;
}
.roles-list {
  margin: 0.7rem 0 0 1.1rem;
  padding: 0;
}
.roles-list > li {
  margin-bottom: 0.3rem;
}
.logout-btn {
  background: #d9534f;
  color: white;
  border: none;
  padding: 0.7rem 0;
  border-radius: 7px;
  width: 100%;
  font-size: 1.13rem;
  cursor: pointer;
  margin-top: 2.3rem;
}
.logout-btn:hover {
  background: #c9302c;
}

</style>
  