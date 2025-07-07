<template>
    <div class="ws-page-wrapper">
        <button class="profile-btn-fixed" @click="showProfile = true">
            <span>👤 User Info</span>
        </button>
        <div class="ws-center-wrap">
            <div class="ws-test-container">
                <h2>WebSocket Connect Test</h2>
                <div>
                    <button @click="refreshToken">Refresh</button>
                </div>

                <!-- WebSocket连接状态与按钮 -->
                 
                <div v-if="!connected" class="ws-status">
                    <span>Status: <strong style="color: #dc3545;">Not Connect</strong></span>
                    <button @click="connectWebSocket" :disabled="connecting">
                        {{ connecting ? 'connecting ...' : 'Connect Websocket' }}
                    </button>
                </div>
                <div v-else class="ws-status">
                    <span>Status: <strong style="color: #28a745;">Connected</strong></span>
                    <button @click="disconnectWebSocket">Disconnect</button>
                </div>

                <!-- 获取在线用户功能 -->
                <div class="online-user-section">
                    <button @click="fetchOnlineUsers" :disabled="loadingOnline" class="get-online-btn">
                        {{ loadingOnline ? 'loading ...' : 'Fetch Active Users' }}
                    </button>
                    <div v-if="onlineUsers.length" class="online-list">
                        <b>Current Active Users：</b>
                        <ul>
                            <li v-for="u in onlineUsers" :key="u">{{ u }}</li>
                        </ul>
                    </div>
                    <div v-else-if="!loadingOnline">
                        <small style="color:#888;">No Active User</small>
                    </div>
                </div>

                <!-- WebSocket收发测试区 -->
                <div v-if="connected" class="ws-messaging">
                    <div class="msg-btns">
                        <input v-model="outgoingMessage" placeholder="Input message (will be echoed)" />
                        
                        <button @click="sendMessage" :disabled="!outgoingMessage">Send</button>
                        <button @click="sendBroadcast" style="margin-left:10px">Send Broadcast</button>
                        <button @click="sendPrivate" style="margin-left:10px">Send Private</button>
                        <button @click="sendTaskComplete" style="margin-left:10px">Task Complete</button>
                        <button @click="sendHeartbeat" style="margin-left:10px">Send Heartbeat</button>
                    </div>
                    <div class="msg-list">
                        <h4>Received messages: </h4>
                        <ul>
                            <li v-for="(msg, i) in messages" :key="i">{{ msg }}</li>
                        </ul>
                    </div>
                </div>
                <p class="ws-log" v-if="wsLog">{{ wsLog }}</p>
                <UserProfileDialog v-if="showProfile" @close="showProfile = false" @logout="handleLogout"/>
            </div>
        </div>
    </div>

</template>

<script>
import UserProfileDialog from './UserProfileDialog.vue';
import config from '../api/config';
import { getOnlineUsers } from '../api/ws';
import { refresh } from '../api/auth';
import SockJS from 'sockjs-client/dist/sockjs.min.js'
import Stomp from 'stompjs'

export default {
    name: 'WebSocketTestPage',
    components: { UserProfileDialog },
    data() {
        return {
            showProfile: false,
            stompClient: null,
            connected: false,
            connecting: false,
            outgoingMessage: '',
            messages: [],
            onlineUsers: [],
            loadingOnline: false, 
            wsLog: '',
            heartbeatInterval: null
        }
    },
    methods: {
        handleLogout() {
            this.showProfile = false;
        },
        connectWebSocket() {
            if (this.stompClient && this.connected) return;
            this.connecting = true;
            this.wsLog = 'Connecting...';

            // 后端 withSockJS，端口建议用 http(s) 协议
            // config.WS_BASE_URL = 'ws://localhost:8095/ws' => http://localhost:8095/ws
            const sockUrl = config.WS_BASE_URL.replace(/^ws/, 'http');
            const socket = new SockJS(sockUrl);

            this.stompClient = Stomp.over(socket);
            this.stompClient.heartbeat.outgoing = 20000;
            this.stompClient.heartbeat.incoming = 20000;
            // 生产环境可关闭 debug log
            this.stompClient.debug = null;

            // 支持 HttpOnly Cookie，无需 Authorization
            this.stompClient.connect({}, frame => {
                this.connected = true;
                this.connecting = false;
                this.wsLog = 'STOMP Connected: ' + frame;

                // 订阅广播
                this.stompClient.subscribe('/topic/test', msg => {
                    this.messages.push('[广播] ' + JSON.parse(msg.body).content);
                });
                // 订阅任务
                this.stompClient.subscribe('/topic/tasks', msg => {
                    this.messages.push('[任务] ' + msg.body);
                });
                // 订阅点对点私信
                this.stompClient.subscribe('/user/queue/notify', msg => {
                    this.messages.push('[私信] ' + msg.body);
                });

                // 心跳包
                this.heartbeatInterval = setInterval(() => {
                    this.sendHeartbeat();
                }, 20000);
            }, error => {
                this.wsLog = '连接失败: ' + error;
                this.connecting = false;
            });
        },
        disconnectWebSocket() {
            if (this.stompClient) {
                this.stompClient.disconnect(() => {
                    this.connected = false;
                    this.wsLog = 'STOMP Disconnected';
                });
                if (this.heartbeatInterval) {
                    clearInterval(this.heartbeatInterval);
                    this.heartbeatInterval = null;
                }
            }
        },
        async refreshToken() {
            try {
                this.wsLog = 'Refreshing token...';
                const res = await refresh();
                if (res && res.code === 200) {
                    this.wsLog = 'Token refreshed successfully!';
                    // 你可以选择做一些页面刷新或者重连 WS（如有必要）
                } else {
                    this.wsLog = 'Token refresh failed: ' + (res && res.msg || 'Unknown error');
                }
            } catch (e) {
                this.wsLog = 'Token refresh failed: ' + (e.message || e);
            }
        },
        sendMessage() {
            if (!this.stompClient || !this.connected || !this.outgoingMessage) return;
            // /app/test 会直接被 echo 回 /topic/test
            this.stompClient.send('/app/test', {}, JSON.stringify({ content: this.outgoingMessage }));
            this.outgoingMessage = '';
        },
        sendBroadcast() {
            if (!this.stompClient || !this.connected) return;
            // 测试广播
            this.stompClient.send('/app/test', {}, JSON.stringify({ content: "Hello from Broadcast!" }));
        },
        sendPrivate() {
            if (!this.stompClient || !this.connected) return;
            const receiver = prompt("Please enter recipient's username");
            const content = prompt("Please enter message");
            if (!receiver || !content) return;
            this.stompClient.send('/app/private/message', {}, JSON.stringify({
                receiverUsername: receiver,
                content
            }));
        },
        sendTaskComplete() {
            if (!this.stompClient || !this.connected) return;
            const taskId = prompt("Please enter task ID.");
            const message = prompt("Please enter task completed message.");
            if (!taskId || !message) return;
            this.stompClient.send('/app/notify/task-complete', {}, JSON.stringify({
                taskId,
                message
            }));
        },
        sendHeartbeat() {
            if (!this.stompClient || !this.connected) return;
            this.stompClient.send("/app/heartbeat", {}, '{}');
        },
        async fetchOnlineUsers() {
            this.loadingOnline = true;
            try {
                const res = await getOnlineUsers();
                this.onlineUsers = res.data.data || [];
            } catch (e) {
                this.onlineUsers = [];
                this.$toast && this.$toast.error('Failed to fetch online users.');
            } finally {
                this.loadingOnline = false;
            }
        }
    },
    beforeUnmount() {
        this.disconnectWebSocket();
    }
}
</script>

<style scoped>
.ws-page-wrapper {
  min-height: 100vh;
  min-width: 100vw;
  position: relative;
}

.ws-center-wrap {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;    /* 垂直居中 */
  justify-content: center; /* 水平居中 */
}

.ws-test-container {
  max-width: 600px;
  width: 100%;
  background: #fafbfc;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
  padding: 2rem;
}
.ws-status {
  margin-bottom: 1rem;
}
.ws-messaging {
  margin-top: 1rem;
}
.msg-list {
  margin-top: 1rem;
  background: #eef6f7;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  max-height: 220px;
  overflow-y: auto;
}
.ws-log {
  margin-top: 1rem;
  color: #6c757d;
  font-size: 0.95rem;
}

.profile-btn-fixed {
  width: auto !important;    /* ← 强力覆盖全局的 width: 100% */
  min-width: unset;
  max-width: 90vw;
  display: inline-flex;
  position: fixed;
  left: 24px;
  top: 24px;
  z-index: 99;
  background: #d5dbdd;
  border: none;
  border-radius: 7px;
  font-size: 1rem;
  padding: 0.38rem 1.08rem;
  cursor: pointer;
  box-shadow: 0 1px 6px rgba(30,30,60,0.07);
  color: #222;
  font-weight: 500;
  display: flex;
  align-items: center;
  transition: background 0.15s;
}

.profile-btn-fixed:hover {
  background: #e5e8ee;
}
.profile-btn-fixed span {
  margin-left: 0.32rem;
}
</style>
