const cron = require("node-cron");
const shell = require("shelljs");

cron.schedule("* * * * *", () => {
  console.log("Scheduler running...");
  if (shell.exec("node updateCsv.js").code !== 0) {
    console.log("Something went wrong");
  }
});
