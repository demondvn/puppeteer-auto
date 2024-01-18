import { Action } from './action';

const link = process.argv[2];

if (!link) {
    console.error('Please provide a link as a command-line argument.');
    process.exit(1);
}

Action(link);
