import * as sh from 'shelljs';

import { Course } from '@tutors-sdk/tutors-lib/src/models/course';
import { writeFile } from '@tutors-sdk/tutors-lib/src/utils/futils';
import { getCurrentDirectory } from '../../../tutors-lib/src/utils/futils';
import { Topic } from '../../../tutors-lib/src/models/topic';

const nunjucks = require('nunjucks');

export function publishTemplate(path: string, file: string, template: string, lo: any): void {
  writeFile(path, file, nunjucks.render(template, { lo: lo }));
}

export class HtmlEmitter {
  emitTopic(topic: Topic, path: string) {
    sh.cd(topic.folder);
    const topicPath = path + '/' + topic.folder;
    publishTemplate(topicPath, 'index.html', 'topic.njk', topic);
    topic.los.forEach((lo) => {});
    sh.cd('..');
  }

  emitCourse(course: Course, path: string) {
    publishTemplate(path, 'index.html', 'course.njk', course);
    course.los.forEach((lo) => {
      this.emitTopic(lo as Topic, path);
    });
  }

  generateCourse(version: string, path: string, course: Course) {
    if (path.charAt(0) !== '/' && path.charAt(1) !== ':') {
      path = getCurrentDirectory() + '/' + path;
    }
    this.emitCourse(course, path);
  }
}
