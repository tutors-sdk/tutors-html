#!/usr/bin/env node
import * as fs from 'fs';
import { Course } from '@tutors-sdk/tutors-lib/src/models/course';
import { HtmlEmitter } from './src/controllers/html-emitter';
const version = require('./package.json').version;

if (fs.existsSync('course.md')) {
  const course = new Course();
  let site = 'json';
  course.publish(site);
  const emitter = new HtmlEmitter();
  emitter.generateCourse(version, site, course);
} else {
  console.log('Cannot locate course.md or portfolio.yaml. Change to course folder and try again. ');
}
