@echo off

start cmd /k "cd /d %~dp0customer && npm run dev"

start cmd /k "cd /d %~dp0royal-backend && npx nodemon server.js"

start cmd /k "cd /d %~dp0royal-gadget-hub && npm run dev"