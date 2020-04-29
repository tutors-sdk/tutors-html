#!/usr/bin/env node
import * as fs from 'fs';
import { Course } from '@tutors-sdk/tutors-lib/src/models/course';
import { HtmlEmitter } from './src/controllers/html-emitter';
import { copyFolder } from '@tutors-sdk/tutors-lib/src/utils/futils';
const tutors = require('./package.json').version;
const tutors_lib = require('./package.json').dependencies['@tutors-sdk/tutors-lib'];

const version = `tutors-json ${tutors} (tutors-lib: ${tutors_lib})`;
const nunjucks = require('nunjucks');
const root = __dirname;
nunjucks.configure(root + '/src/viewskit', { autoescape: false });
nunjucks.installJinjaCompat();

if (fs.existsSync('course.md')) {
  let site = 'public-site';
  const course = new Course();
  console.log(`Static course generator ${version}`);
  course.publish(site);
  const emitter = new HtmlEmitter();
  emitter.generateCourse(site, course);
  console.log(`${version}`);
  copyFolder(`${root}/src/assets`, site);
} else {
  console.log('Cannot locate course.md. Change to course folder and try again. ');
}
