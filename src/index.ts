import { Action } from './action';
require('dotenv').config();
const link = process.argv[2];

if (!link) {
    console.error('Please provide a link as a command-line argument.');
    process.exit(1);
}

Action(link);
console.log(process.env.USER_DATA_DIR)