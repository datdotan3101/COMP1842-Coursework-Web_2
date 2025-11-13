import axios from "axios";
import Vue from "vue";
import VueFlashMessage from "vue-flash-message";
import "vue-flash-message/dist/vue-flash-message.min.css";

Vue.use(VueFlashMessage, {
  messageOptions: {
    timeout: 3000,
    pauseOnInteract: true,
  },
});
const baseURL = "http://localhost:3000/words/";

const vm = new Vue();

const handleError =
  (fn) =>
  (...params) =>
    fn(...params).catch((error) => {
      // console.log(error);
      if (error.response) {
        // Nếu có phản hồi lỗi từ server (VD: 404, 500)
        vm.flash(
          `${error.response.status}: ${error.response.statusText}`,
          "error"
        );
      } else if (error.request) {
        // Nếu server không phản hồi (lỗi mạng, server sập)
        vm.flash("Server không phản hồi. API đang chạy chứ?", "error");
      } else {
        // Lỗi khác
        vm.flash(`Lỗi: ${error.message}`, "error");
      }
      return Promise.reject(error);
    });

export const api = {
  getWord: handleError(async (id) => {
    const res = await axios.get(baseURL + id);
    return res.data;


  }),

  getWords: handleError(async () => {
    const res = await axios.get(baseURL);
    return res.data;
  }),

  deleteWord: handleError(async (id) => {
    const res = await axios.delete(baseURL + id);
    return res.data;
  }),

  createWord: handleError(async (payload) => {
    const res = await axios.post(baseURL, payload);
    return res.data;
  }),

  updateWord: handleError(async (payload) => {
    const res = await axios.put(baseURL + payload._id, payload);
    return res.data;
  }),
};
