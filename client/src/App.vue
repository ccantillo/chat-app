<template>
  <div class="container">
    <h1 class="page-headline">Czat Lite</h1>
    <!-- Responsive toggle switch -->
    <div class="switch-box" v-if="isReady">
      <ul class="switch-list">
        <li
          class="list-item"
          :class="{ selected: selected === 0 }"
          @click="changeSelected(0), (isPreview = false)"
        >
          Użytkownicy
        </li>
        <li
          class="list-item"
          :class="{ selected: selected === 1 }"
          @click="changeSelected(1), (isPreview = true)"
        >
          Czat
        </li>
      </ul>
    </div>
    <!-- End Responsive toggle -->

    <JoinUserComponent
      v-if="!isReady"
      v-model:username="username"
      @submit="joinToChat"
      :errorLoginMsg="errorLoginMsg"
    />
    <!--<div class="wrapper" v-if="isReady">
      <createRoomComponent
        :isPreview="isPreview"
        :messages="messages"
        :isTyping="isTyping"
        :userId="userId"
        :errorSendMsg="errorSendMsg"
        v-model:roomName="roomName"
        @submit="createRoom"
      />
    </div>-->

    <div class="wrapper" v-if="isReady">
      <createRoomComponent
        :isPreview="isPreview"
        :messages="messages"
        :isTyping="isTyping"
        :userId="userId"
        :errorSendMsg="errorSendMsg"
        v-model:roomName="roomName"
        @submit="createRoom"
      />
      <UserListComponent 
      :users="users" 
      :roomId="roomId" 
      :rooms="rooms" 
      :isPreview="isPreview"
      v-model:roomId="roomId"
      />

      <ChatBoxComponent
        :isPreview="isPreview"
        :messages="messages"
        :isTyping="isTyping"
        :userId="userId"
        :errorSendMsg="errorSendMsg"
        v-model:message="message"
        @submit="sendMessage"
      />
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client'
import { ref, watch } from 'vue'

import JoinUserComponent from '@/components/LoginBox'
import UserListComponent from '@/components/UserList'
import ChatBoxComponent from '@/components/ChatBox'
import createRoomComponent from '@/components/createRoom.vue'

export default {
  name: 'App',
  components: {
    JoinUserComponent,
    UserListComponent,
    ChatBoxComponent,
    createRoomComponent
  },
  setup() {
    const socket = io('http://192.168.1.86:3000')
    const users = ref([])
    const rooms = ref([])
    const messages = ref([])
    const message = ref('')
    const roomId = ref('')
    const roomName = ref('')
    const username = ref('')
    const selected = ref(0)

    let isReady = ref(false)
    let isPreview = ref(false)
    let isTyping = ref(false)
    let userId = ref('')

    const changeSelected = (i) => {
      selected.value = i
    }

    /*********VALIDATE************* */

    let errorLoginMsg = ref('')
    let errorSendMsg = ref('')

    //***************Socket function*******************

    socket.on('initChat', (data) => {
      messages.value = data.messages
    })

    socket.on('userConnected', (username) => {
      console.log(`${username} has joined`)
    })

    socket.on('userDisconnected', (username) => {
      console.log(`${username} has leaved`)
    })

    socket.on('getUsers', (data) => {
      users.value = data
    })
    socket.on('getRooms', (data) => {
      rooms.value = data
    })

    socket.on('newMessage', (data) => {
      messages.value.push(data)
    })
    socket.on('newRoom', (data) => {
      rooms.value.push(data)
    })
    socket.on('refreshChat', (data) => {
      messages.value = data
    })

    // *********User Typing********

    socket.on('isTyping', (data) => {
      isTyping.value = data
    })
    socket.on('stopTyping', () => {
      isTyping.value = false
    })

    watch(message, (m) => {
      m ? socket.emit('isTyping', username.value) : socket.emit('stopTyping')
    })

    watch(roomId, (m) => {
      m ? socket.emit('newRoomId', roomId): ''
    })

    //*****Join User to Chat************

    const joinToChat = () => {
      if (/^(([a-zA-Z0-9]{3,}))+$/.test(username.value) == false) {
        errorLoginMsg.value = 'Użuj minimum 3 liter lub cyfr'
      } else {
        socket.emit('enterUsername', { username: username.value })
        username.value = ''
        isReady.value = true
        userId.value = socket.id
      }
    }

    /*********Send New Message******** */

    const sendMessage = () => {
      if (message.value == '') {
        errorSendMsg.value = 'Pole nie może być puste'
      } else {
        console.log('the room id is ', roomId.value)
        socket.emit('newMessage', {
          room: roomId,
          username: username.value,
          message: message.value,
        })
        message.value = ''
      }
    }

    const createRoom = () => {
      if (roomName.value == '') {
        errorSendMsg.value = 'Pole nie może być puste'
      } else {
        console.log('the room id is ', roomId)
        socket.emit('newRoom', {
          roomName: roomName.value,
        })
        roomName.value = ''
      }
    }

    return {
      socket,
      username,
      message,
      roomName,
      users,
      rooms,
      roomId,
      messages,
      joinToChat,
      sendMessage,
      createRoom,
      userId,
      isReady,
      isTyping,
      isPreview,
      selected,
      changeSelected,
      errorLoginMsg,
      errorSendMsg,
    }
  },
}
</script>

<style lang="scss">
@use './scss/index.scss' as *;

.wrapper {
  @include flex;
  width: 100%;
  height: 30rem;
}
/*******MEDIA_QUERY*************/

@include smallerPhone {
  .container {
    font-size: $font_size_to_340;
    .wrapper {
      width: 100%;
    }
  }
}
@include mostPhone {
  .container {
    font-size: $font_size_to_340;
    .wrapper {
      width: 100%;
    }
  }
}
@include mostTablets {
  .container {
    font-size: $font_size_to_576;
    .wrapper {
      width: 100%;
    }
  }
}
@include smallerDesktop {
  .container {
    font-size: $font_size_to_1200;
    .wrapper {
      width: 100%;
    }
  }
}
</style>
