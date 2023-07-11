const fs = require('fs');
const readline = require('readline');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const questions = [
  "Is it a major update? (y/n) ",
  "Did you add a new feature? (y/n) ",
  "Is it a bug fix/minor update? (y/n) "
];

let answers = [];

function askQuestion(index) {
  if (index === questions.length) {
    updateManifest();
    return;
  }

  rl.question(questions[index], function(answer) {
    answers.push(answer);
    askQuestion(index + 1);
  });
}

function updateManifest() {
  const manifestPath = path.join(__dirname, '/src/manifest.json');
  const manifest = require(manifestPath);
  let version = manifest.version.split('.');

  if (answers[0] === 'y') version[0] = Number(version[0]) + 1;
  if (answers[1] === 'y') version[1] = Number(version[1]) + 1;
  if (answers[2] === 'y') version[2] = Number(version[2]) + 1;

  manifest.version = version.join('.');

  fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8', function(err) {
    if (err) {
      console.log('An error occurred while writing the manifest file.');
      console.error(err);
      process.exit(1);
    } else {
      console.log('Manifest file has been updated.');
      rl.close();
    }
  });
}

askQuestion(0);
