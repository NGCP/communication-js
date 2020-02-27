# NGCP Communication for JavaScript

[![Build Status](https://travis-ci.org/NGCP/communication-js.svg?branch=master)](https://travis-ci.org/NGCP/communication-js)
[![Coverage Status](https://coveralls.io/repos/github/NGCP/communication-js/badge.svg?branch=master&service=github)](https://coveralls.io/github/NGCP/communication-js?branch=master)
[![dependencies Status](https://david-dm.org/NGCP/communication-js/status.svg)](https://david-dm.org/NGCP/communication-js)
[![devDependencies Status](https://david-dm.org/NGCP/communication-js/dev-status.svg)](https://david-dm.org/NGCP/communication-js?type=dev)

## Introduction

NGCP's communication framework for JSON-based communication in Node.js JavaScript framework.

## Quick start

To use this package in your Node.js project, you will need to clone this repository in the same
directory as your project, and create a dependency on it:

```bash
# from your project directory
cd ..
git clone https://github.com/NGCP/communication-js.git
cd communication-js
npm link
cd ../your-project-name
npm link communication-js
```

Whenever the code here is updated, you can simply run `git pull` in your local `communication-js`
directory and the code will update.

## License

[MIT](https://github.com/NGCP/communication-js/blob/master/LICENSE)
