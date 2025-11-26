<template>
  <div class="test-container">
    <h1>Test page (Multiple Choice)</h1>

    <div v-if="loading" class="loading-state">
      <p>Loading...</p>
    </div>

    <div v-else-if="!showResult && words.length > 0">
      <div class="progress">
        Question {{ currentIndex + 1 }} / {{ words.length }}
      </div>

      <div class="question-card">
        <h2 class="word-display">{{ currentWord.german }}</h2>
        
        <div class="options-grid">
          <button 
            v-for="(option, index) in currentOptions" 
            :key="index"
            @click="selectOption(option)"
            :disabled="isChecked"
            :class="['option-btn', getOptionClass(option)]"
          >
            {{ option.english }}
          </button>
        </div>

        <div v-if="feedback" :class="['feedback-msg', isCorrect ? 'success' : 'error']">
          {{ feedback }}
        </div>
        
        <button 
          @click="handleAction" 
          :class="['btn-action', isChecked ? 'btn-next' : 'btn-check']"
          :disabled="!selectedOption && !isChecked"
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
      
      selectedOption: null, 
      currentOptions: [], // Contain 4 answer for currrent question

      score: 0,
      showResult: false,
      loading: true,
      
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
        if (this.words.length > 0) this.generateOptions();
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    // Genarate answer
    generateOptions() {
      const correct = this.currentWord;
      // Filter other answer to wrong answer
      const distractors = this.words
        .filter(w => w._id !== correct._id)
        .sort(() => 0.5 - Math.random()) 
        .slice(0, 3); 

      // Merge answer, random
      const options = [...distractors, correct];
      this.currentOptions = options.sort(() => 0.5 - Math.random());
    },

    // Choose answer
    selectOption(option) {
      if (this.isChecked) return; 
      this.selectedOption = option;
    },

    getOptionClass(option) {
      // Hight selecting
      if (!this.isChecked) {
        return this.selectedOption === option ? 'selected' : '';
      }
      
      // 1.correct - green
      if (option._id === this.currentWord._id) {
        return 'correct-answer';
      }
      // 2. Wrong - red
      if (this.selectedOption === option && option._id !== this.currentWord._id) {
        return 'wrong-answer';
      }
      
      return 'disabled-option';
    },

    handleAction() {
      if (this.isChecked) {
        this.nextQuestion();
      } else {
        this.checkAnswer();
      }
    },

    checkAnswer() {
      if (!this.selectedOption) return; 

      this.isChecked = true; 

      if (this.selectedOption._id === this.currentWord._id) {
        this.score++;
        this.isCorrect = true;
        this.feedback = 'Correct! 🎉';
      } else {
        this.isCorrect = false;
        this.feedback = `Wrong! The correct answer is "${this.currentWord.english}"`; 
      }
    },

    nextQuestion() {
      if (this.currentIndex < this.words.length - 1) {
        this.currentIndex++;
        
        // Restate new question
        this.selectedOption = null;
        this.isChecked = false;
        this.feedback = '';
        this.isCorrect = false;
        
        // New quiz
        this.generateOptions();
      } else {
        this.showResult = true;
      }
    },

    resetState() {
      this.currentIndex = 0;
      this.score = 0;
      this.selectedOption = null;
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
.test-container { text-align: center; max-width: 600px; margin: 40px auto; font-family: 'Arial', sans-serif; }

.question-card, .result-card {
  background: white;
  border: 1px solid #e0e0e0;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.word-display { font-size: 2.5em; color: #34495e; margin: 20px 0; }

.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; 
  gap: 15px;
  margin-bottom: 25px;
}

.option-btn {
  padding: 15px;
  font-size: 1.1em;
  background-color: #f8f9fa;
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #2c3e50;
}

.option-btn:hover:not(:disabled) {
  background-color: #e2e6ea;
  border-color: #bdc3c7;
}

.option-btn.selected {
  border-color: #3498db;
  background-color: #ebf5fb;
  color: #2980b9;
  font-weight: bold;
}

.option-btn.correct-answer {
  background-color: #d4edda !important;
  border-color: #28a745 !important;
  color: #155724 !important;
}

.option-btn.wrong-answer {
  background-color: #f8d7da !important;
  border-color: #dc3545 !important;
  color: #721c24 !important;
}

.option-btn.disabled-option {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Button styles main */
.btn-action, .btn-retry { 
  padding: 12px 25px; 
  font-size: 1em; 
  color: white; 
  border: none; 
  border-radius: 6px; 
  cursor: pointer; 
  transition: all 0.3s;
  width: 100%;
  margin-top: 10px;
}
.btn-check { background-color: #3498db; }
.btn-next { background-color: #42b983; }
.btn-retry { background-color: #f39c12; }
.btn-action:disabled { background-color: #bdc3c7; cursor: not-allowed; }
.btn-action:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }

/* Feedback styles */
.feedback-msg { margin-top: 15px; font-weight: bold; font-size: 1.1em; padding: 10px; border-radius: 6px; }
.feedback-msg.success { background-color: #e8f8f5; color: #27ae60; }
.feedback-msg.error { background-color: #fdedec; color: #c0392b; }

.score-display { font-size: 3em; margin: 20px 0; color: #2c3e50; }
.score-number { font-weight: bold; color: #42b983; }
</style>