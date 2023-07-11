const os = require('os');
const shell = require('shelljs');

if (os.type() === 'Windows_NT') {
    console.log('Preparing dev... windows');
  shell.exec('del /s /q dist && rmdir /s /q dist && mkdir dist && xcopy /E /I src dist');
} else {
  console.log('Preparing dev... unix');
  shell.exec('rm -rf dist/* && cp -R src/* dist/');
}
