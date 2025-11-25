<template>
  <div class="test-container">
    <h1>Test page</h1>

    <div v-if="loading" class="loading-state">
      <p>Loading...</p>
    </div>

    <div v-else-if="!showResult && words.length > 0">
      <div class="progress">
        Question {{ currentIndex + 1 }} / {{ words.length }}
      </div>

      <div class="question-card">
        <h2 class="word-display">{{ currentWord.german }}</h2>
        
        <input 
          v-model="userAnswer" 
          @keyup.enter="handleAction"
          placeholder="Enter english meaning..." 
          class="answer-input"
          :disabled="isChecked" 
          ref="answerInput"
        />

        <div v-if="feedback" :class="['feedback-msg', isCorrect ? 'success' : 'error']">
          {{ feedback }}
        </div>
        
        <button 
          @click="handleAction" 
          :class="['btn-action', isChecked ? 'btn-next' : 'btn-check']"
        >
          {{ isChecked ? 'Next' : 'Check' }}
        </button>
      </div>
    </div>

    <div v-else-if="showResult" class="result-card">
      <h2>Finished!</h2>
      <div class="score-display">
        <span class="score-number">{{ score }}</span>
        <span class="score-total">/ {{ words.length }}</span>
      </div>
      <p>Correct {{ Math.round((score/words.length)*100) }}% question.</p>
      
      <button @click="resetTest" class="btn-retry">New test</button>
    </div>
  </div>
</template>

<script>
import { api } from '../helpers/helpers'; 

export default {
  name: 'TestPage',
  data() {
    return {
      words: [],
      currentIndex: 0,
      userAnswer: '',
      score: 0,
      showResult: false,
      loading: true,
      
      // State to process UI
      isChecked: false, 
      isCorrect: false, 
      feedback: ''      
    };
  },
  computed: {
    currentWord() {
      return this.words[this.currentIndex];
    }
  },
  async created() {
    await this.fetchWords();
  },
  methods: {
    async fetchWords() {
      this.loading = true;
      try {
        const response = await api.getTestWords();
        this.words = response;
        this.resetState();
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    // Function process enter keyboard
    handleAction() {
      if (this.isChecked) {
        this.nextQuestion();
      } else {
        this.checkAnswer();
      }
    },

    checkAnswer() {
        // Do not allow empty
      if (!this.userAnswer) return; 

      const correct = this.currentWord.english.toLowerCase().trim();
      const user = this.userAnswer.toLowerCase().trim();

      this.isChecked = true; 

      if (correct === user) {
        this.score++;
        this.isCorrect = true;
        this.feedback = 'Correct! 🎉';
      } else {
        this.isCorrect = false;
       // Display correct answer
        this.feedback = `Wrong, correct answer is: "${this.currentWord.english}"`; 
      }
    },

    nextQuestion() {
      if (this.currentIndex < this.words.length - 1) {
        this.currentIndex++;
        // Reset new questions
        this.userAnswer = '';
        this.isChecked = false;
        this.feedback = '';
        this.isCorrect = false;
        
        // Auto focus input test
        this.$nextTick(() => {
          if(this.$refs.answerInput) this.$refs.answerInput.focus();
        });
      } else {
        this.showResult = true;
      }
    },

    resetState() {
      this.currentIndex = 0;
      this.score = 0;
      this.userAnswer = '';
      this.showResult = false;
      this.isChecked = false;
      this.feedback = '';
    },
    
    async resetTest() {
      await this.fetchWords();
    }
  }
};
</script>

<style scoped>
.test-container { text-align: center; max-width: 500px; margin: 40px auto; font-family: 'Arial', sans-serif; }

.question-card, .result-card {
  background: white;
  border: 1px solid #e0e0e0;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.word-display { font-size: 2.5em; color: #34495e; margin: 20px 0; }

.answer-input { 
  padding: 12px; 
  width: 100%; 
  box-sizing: border-box; 
  font-size: 1.1em; 
  border: 2px solid #ddd;
  border-radius: 6px;
  margin-bottom: 15px;
  outline: none;
}
.answer-input:focus { border-color: #42b983; }

/* Button styles */
.btn-action, .btn-retry { 
  padding: 12px 25px; 
  font-size: 1em; 
  color: white; 
  border: none; 
  border-radius: 6px; 
  cursor: pointer; 
  transition: all 0.3s;
  width: 100%;
}
.btn-check { background-color: #3498db; }
.btn-next { background-color: #42b983; }
.btn-retry { background-color: #f39c12; }
.btn-action:hover { opacity: 0.9; transform: translateY(-1px); }

/* Feedback styles */
.feedback-msg { margin-bottom: 15px; font-weight: bold; font-size: 1.1em; padding: 10px; border-radius: 6px; }
.feedback-msg.success { background-color: #e8f8f5; color: #27ae60; }
.feedback-msg.error { background-color: #fdedec; color: #c0392b; }

.score-display { font-size: 3em; margin: 20px 0; color: #2c3e50; }
.score-number { font-weight: bold; color: #42b983; }
</style>