const moongoose = require("mongoose");
const Schema = moongoose.Schema;

const VocabSchema = new Schema(
  {
    english: {
      type: String,
      required: "English word is required ",
    },
    german: {
      type: String,
      required: "German word is cannot be blank",
    },
    },
  { collection: "vocab" }
);

module.exports = moongoose.model("Vocab", VocabSchema);
