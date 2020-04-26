#!/usr/bin/env node
import * as fs from 'fs';
import { Course } from '@tutors-sdk/tutors-lib/src/models/course';
import { HtmlEmitter } from './src/controllers/html-emitter';
import { copyFolder } from '@tutors-sdk/tutors-lib/src/utils/futils';
const version = require('./package.json').version;

const nunjucks = require('nunjucks');
const root = __dirname;
nunjucks.configure(root + '/src/viewskit', { autoescape: false });
nunjucks.installJinjaCompat();

if (fs.existsSync('course.md')) {
  let site = 'public-site';
  const course = new Course();
  course.publish(site);
  const emitter = new HtmlEmitter();
  emitter.generateCourse(version, site, course);
  copyFolder(`${root}/src/assets`, site);
} else {
  console.log('Cannot locate course.md or portfolio.yaml. Change to course folder and try again. ');
}
