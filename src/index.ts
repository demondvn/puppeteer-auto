#!/usr/bin/env node
import { Command } from 'commander';
import { Action, clearData } from './action';
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
.option('-o, --overwrite', 'Overwrite data  ')
.option('-u, --url <url>', 'Url to load site')
.action(async (link) =>{
    console.log(program.opts())
    if(program.opts().overwrite) {
        console.log('Overwrite')
        clearData(program.opts().path);
    }
    Action(link,program.opts().path,program.opts().browser,program.opts().url);
});

program.parse(process.argv);