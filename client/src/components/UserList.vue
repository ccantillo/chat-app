<template>
  <div class="users-box" :class="[isPreview ? 'none' : '']">
    <h3 class="users-headline">Users Online:</h3>
    <ul class="users-list" v-for="u in users" :key="u.id">
      <li class="user-list-item">{{ u.username }}</li>
    </ul>
    <h3 class="users-headline">Rooms:</h3>
    <ul class="users-list" v-for="r in rooms" :key="r.date">
      <li>
          <button @click="(event) => {$emit('update:roomId', r._id)}" class="btn send-button user-list-item">{{ r.name }}</button>
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, nextTick, onUpdated } from 'vue'

export default {
  emits: ['update:roomName', 'createRoom', 'joinToChat', 'update:roomId'],
  props: {
    roomName: {
      type: String,
      required: false,
    },
    open: false,
    rooms: {
      type: Array,
      required: true,
    },
    users: {
      type: Array,
      required: true,
    },
    roomId: {
      type: String,
      required: false,
      value: "1"
    },
    isPreview: {
      type: Boolean,
      required: true,
    },
  },
  setup() {
    let refscrollHeight = ref(null)

    const update = () => {
      nextTick(() => {
        console.log("tick")
      })
    }

    onUpdated(update)

    return {
      update,
      refscrollHeight,
    }
  },
}
</script>

<style lang="scss" scoped>
.send-button {
  width: 100%;
}
.container-join {
  @include flex;
  width: 50%;
  border: 2px $accent_color solid;
  box-shadow: 7px 5px 46px -16px $accent_color;
  .join-form {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-content: space-around;
    .page-start {
      margin: 2rem 0 3rem 0;
      text-transform: uppercase;
      text-align: center;
    }
    .join-box {
      margin: 3rem 0 6rem 0;
    }
    .form-button {
      padding: 1.2rem 2.8rem;
      margin: 0 0 2rem 0;
    }
  }
}

.modal {
  position: fixed;
  z-index: 999;
  top: 20%;
  left: 50%;
  width: 300px;
  margin-left: -150px;
  background-color: white;
}
.color{
  color: black;
}
.users-box {
  width: 50%;
  min-height: 100%;
  box-shadow: 7px 5px 46px -16px $accent_color;
  border: 2px solid $accent_color;
  color: #fff;
  margin: 1rem;
  .users-headline {
    @include flex;
    border-bottom: 2px solid $accent_color;
    background-color: rgba($accent_color, 0.5);
    padding: 1.3rem 0;
    margin: 0;
    text-transform: uppercase;
    text-align: center;
  }
}

/*******MEDIA_QUERY*************/

@include smallerPhone {
  .users-box {
    width: 100%;
    margin: 0.5rem;
  }
}
@include mostPhone {
  .users-box {
    width: 100%;
  }
}
@include mostTablets {
  .users-box {
    width: 100%;
  }
}
</style>
