#!/usr/bin/env sh
npm test && git add -A && git commit -m "$*" && git push heroku main
