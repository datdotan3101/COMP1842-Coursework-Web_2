<template>
  <form action="#" @submit.prevent="onSubmit">
    
    <p v-if="errorMessage" class="error">
      <i class="exclamation triangle icon"></i>
      {{ errorMessage }}
    </p>

    <div class="ui fluid action input mb-10">
      <div class="ui label">
        <i class="united kingdom flag"></i> English
      </div>
      <input 
        type="text" 
        placeholder="Enter word or phrase..." 
        v-model="word.english" 
      />
      <button 
        class="ui teal right labeled icon button" 
        @click.prevent="suggestMeaning"
        :class="{ loading: isSuggesting }"
        :disabled="!word.english"
      >
        <i class="magic icon"></i> Suggest
      </button>
    </div>

    <div class="ui labeled input fluid mb-10">
      <div class="ui label">
        <i class="germany flag"></i> German
      </div>
      <input 
        type="text" 
        placeholder="German word..." 
        v-model="word.german" 
      />
    </div>

    <div class="ui labeled input fluid mb-10">
      <div class="ui label">
        <i class="vn flag"></i> Vietnamese
      </div>
      <input 
        type="text" 
        placeholder="Vietnamese word..." 
        v-model="word.vietnamese" 
      />
    </div>

    <button class="positive ui button">Submit</button>
  </form>
</template>

<script>
import axios from 'axios';

export default {
  name: 'word-form',
  props: {
    word: {
      type: Object,
      required: false,
      default: () => {
        return { english: '', german: '', vietnamese: '' };
      }
    }
  },
  data() {
    return {
      errorMessage: '',
      isSuggesting: false,
      originalWord: {}
    };
  },
  watch: {
    word: {
      handler(newVal) {
        this.originalWord = JSON.parse(JSON.stringify(newVal));
      },
      immediate: true
    }
  },
  methods: {
    isValidText(text) {
      if (!text) return false;
      const pattern = /^[\p{L}\s]+$/u;
      return pattern.test(text);
    },

   onSubmit: function() {
      const formatText = (text) => {
        if (!text) return '';
        const trimmed = text.trim();
        return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
      };

      // 1. Process & Format Data 
      let newEnglish = this.word.english ? formatText(this.word.english) : '';
      let newVietnamese = this.word.vietnamese ? formatText(this.word.vietnamese) : '';
      let newGerman = this.word.german ? this.word.german.trim() : ''; 

      this.word.english = newEnglish;
      this.word.vietnamese = newVietnamese;
      this.word.german = newGerman;

      // 2. Check Empty
      if (newEnglish === '' || newGerman === '' || newVietnamese === '') {
        this.errorMessage = 'Please fill out all fields!';
        return;
      }

      
      if (
        newEnglish === this.originalWord.english &&
        newGerman === this.originalWord.german &&
        newVietnamese === this.originalWord.vietnamese
      ) {
        this.errorMessage = 'No changes.';
        return; 
      }
      // ----------------------------

      // 3. Validate Regex
      if (!this.isValidText(newEnglish)) {
        this.errorMessage = 'English invalid: Text only';
        return;
      }
      if (!this.isValidText(newGerman) || !this.isValidText(newVietnamese)) {
        this.errorMessage = 'Meaning invalid: Text only';
        return;
      }

      // 4. Valid
      this.errorMessage = '';
      this.$emit('createOrUpdate', this.word);
    },

   async suggestMeaning() {
      if (!this.word.english) return;
      
      // Trim input
      this.word.english = this.word.english.trim();

      // Check regex
      if (!this.isValidText(this.word.english)) {
         this.errorMessage = 'Invalid input. Please enter text only.';
         return;
      }

      this.isSuggesting = true;
      this.errorMessage = '';

      try {

        const urlDe = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=de&dt=t&q=${encodeURI(this.word.english)}`;
        const resDe = await axios.get(urlDe);
        if (resDe.data && resDe.data[0] && resDe.data[0][0]) {
           this.word.german = resDe.data[0][0][0];
        }

        const urlVi = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURI(this.word.english)}`;
        const resVi = await axios.get(urlVi);
        if (resVi.data && resVi.data[0] && resVi.data[0][0]) {
           this.word.vietnamese = resVi.data[0][0][0];
        }

      } catch (error) {
        console.error(error);
        this.errorMessage = 'Suggestion failed. Please check your internet.';
      } finally {
        this.isSuggesting = false;
      }
    }
  }
};
</script>

<style scoped>
.error {
  color: #9f3a38;
  background-color: #fff6f6;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #e0b4b4;
  margin-bottom: 15px;
  font-weight: bold;
}
.ui.label {
  font-size: 1.1rem;
  width: 10rem;
  display: flex;
  align-items: center; 
}
.ui.label i.flag {
  margin-right: 0.5em;
}
.mb-10 {
  margin-bottom: 15px;
}
</style>