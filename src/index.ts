#!/usr/bin/env node
import { Command } from 'commander';
import { Action } from './action';
require('dotenv').config();

const link = process.argv[2];

if (!link) {
    console.error('Please provide a link as a command-line argument.');
    process.exit(1);
}

// Action(link);
console.log(process.env.USER_DATA_DIR)
const program = new Command();
program
.name('site-load')
.description('Load site')
.version('0.0.1')

program.
argument('<link>', "Link to load site")
.option('-p, --path <path>', 'Path to save site','./data')
.option('-b, --browser <browser>', 'Browser to load site')
.action((link) =>{
    console.log(program.opts())
    Action(link,program.opts().path,program.opts().browser)
});

program.parse(process.argv);