#!/bin/bash

forever -l /var/log/assistant.log --append start {{path}}/index.js
