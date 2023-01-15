const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

let correctAnswer, buttonAanswer, buttonBanswer, buttonCanswer, buttonDanswer;

async function getTriviaData() {
  const url = "https://the-trivia-api.com/api/questions?limit=1";
  try {
    const res = await fetch(url);
    const data = await res.json();
    return outputTriviaQuestion(data);
  } catch (error) {
    console.log(error);
    return "Error";
  }
}

function outputTriviaQuestion(data) {
  let output = "";
  data.forEach((info) => {
    correctAnswer = info.correctAnswer;
    let answers = [
      info.correctAnswer,
      info.incorrectAnswers[0],
      info.incorrectAnswers[1],
      info.incorrectAnswers[2],
    ];
    shuffle(answers);
    getIndexOfCorrectAnswer(answers);
    output += `Q: ${info.question}\n\nA: ${answers[0]}\nB: ${answers[1]}\nC: ${answers[2]}\nD: ${answers[3]}`;
  });
  return output;
}

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

function getIndexOfCorrectAnswer(array) {
  let index;
  buttonAanswer = false;
  buttonBanswer = false;
  buttonCanswer = false;
  buttonDanswer = false;
  for (let i = 0; i < array.length; i++) {
    if (array[i] == correctAnswer) {
      index = i;
    }
  }
  if (index == 0) {
    buttonAanswer = true;
  } else if (index == 1) {
    buttonBanswer = true;
  } else if (index == 2) {
    buttonCanswer = true;
  } else {
    buttonDanswer = true;
  }
}

module.exports = {
  name: "trivia",
  description: "Gives a trivia question",
  // devOnly: Boolean,
  testOnly: true,
  // options: Object[],
  // deleted: Boolean,

  callback: async (client, interaction) => {
    let correct = false;
    let buttonAPressed = true,
      buttonBPressed = true,
      buttonCPressed = true,
      buttonDPressed = true;
    let triviaQuestion = await getTriviaData();
    const triviaMessage = await interaction.reply({
      fetchReply: true,
      embeds: [
        new EmbedBuilder({
          title: triviaQuestion,
        }).setColor("Blue"),
      ],

      components: [
        new ActionRowBuilder({
          components: [
            new ButtonBuilder({
              customId: "buttonA",
              label: "A",
              buttonAnswer: buttonAanswer,
              style: ButtonStyle.Success,
            }),
            new ButtonBuilder({
              customId: "buttonB",
              label: "B",
              buttonAnswer: buttonBanswer,
              style: ButtonStyle.Success,
            }),
            new ButtonBuilder({
              customId: "buttonC",
              label: "C",
              buttonAnswer: buttonCanswer,
              style: ButtonStyle.Success,
            }),
            new ButtonBuilder({
              customId: "buttonD",
              label: "D",
              buttonAnswer: buttonDanswer,
              style: ButtonStyle.Success,
            }),
          ],
        }),
      ],
    });

    const collecter = triviaMessage.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
      time: 20000,
    });

    const w = Math.floor(Math.random() * (4 - 1) + 1);
    console.log(correctAnswer);
    collecter.on("ignore", (i) =>
      i.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder({
            title: "You Are not allowed",
          }).setColor("Red"),
        ],
      })
    );

    collecter.on("collect", (i) => {
      if (i.customId == "buttonA") {
        buttonAPressed = false;
      } else if (i.customId == "buttonB") {
        buttonBPressed = false;
      } else if (i.customId == "buttonC") {
        buttonCPressed = false;
      } else if (i.customId == "buttonD") {
        buttonDPressed = false;
      }

      if (buttonAanswer == true && buttonAPressed == false) {
        correct = true;
      } else if (buttonBanswer == true && buttonBPressed == false) {
        correct = true;
      } else if (buttonCanswer == true && buttonCPressed == false) {
        correct = true;
      } else if (buttonDanswer == true && buttonDPressed == false){
        correct = true;
      }

      i.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder({
            title: correct ? "You are correct" : "You are wrong",
          }),
        ],
      });
      collecter.stop(i);
    });

    collecter.on("end", (collected, reason) =>
      triviaMessage.edit({
        components: [
          new ActionRowBuilder({
            components: [
              new ButtonBuilder({
                disabled: buttonAPressed,
                customId: "buttonA",
                label: "A",
                style: ButtonStyle.Success,
              }),
              new ButtonBuilder({
                disabled: buttonBPressed,
                customId: "buttonB",
                label: "B",
                style: ButtonStyle.Success,
              }),
              new ButtonBuilder({
                disabled: buttonCPressed,
                customId: "buttonC",
                label: "C",
                style: ButtonStyle.Success,
              }),
              new ButtonBuilder({
                disabled: buttonDPressed,
                customId: "buttonD",
                label: "D",
                style: ButtonStyle.Success,
              }),
            ],
          }),
        ],
      })
    );
  },
};
