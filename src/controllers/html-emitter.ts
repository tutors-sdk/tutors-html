import * as sh from 'shelljs';

import { Course } from '@tutors-sdk/tutors-lib/src/models/course';
import { writeFile } from '@tutors-sdk/tutors-lib/src/utils/futils';
import { getCurrentDirectory } from '../../../tutors-lib/src/utils/futils';
import { Topic, Unit } from '../../../tutors-lib/src/models/topic';
import { Lab } from '@tutors-sdk/tutors-lib/src/models/lab';
import { MarkdownParser } from './markdown-parser';
import { LearningObject } from '@tutors-sdk/tutors-lib/src/models/lo';

const nunjucks = require('nunjucks');

export function publishTemplate(path: string, file: string, template: string, lo: any): void {
  writeFile(path, file, nunjucks.render(template, { lo: lo }));
}

export class HtmlEmitter {
  parser = new MarkdownParser();

  emitLab(lab: Lab, path: string) {
    lab.chapters.forEach((chapter) => {
      chapter.content = this.parser.parse(chapter.contentMd);
    });
    const labPath = path + '/' + lab.folder;
    publishTemplate(labPath, 'index.html', 'lab.njk', lab);
  }

  emitUnit(unit: Unit, path: string) {
    unit.los.forEach((lo) => {
      if (lo.lotype == 'lab') {
        this.emitLab(lo as Lab, path);
      }
    });
  }

  emitLo(lo: LearningObject, path: string) {
    if (lo.lotype == 'unit') {
      const unitPath = path + '/' + lo.folder;
      this.emitUnit(lo as Unit, unitPath);
    } else {
      if (lo.lotype == 'lab') {
        this.emitLab(lo as Lab, path);
      }
    }
  }

  emitTopic(topic: Topic, path: string) {
    sh.cd(topic.folder);
    const topicPath = path + '/' + topic.folder;
    publishTemplate(topicPath, 'index.html', 'topic.njk', topic);
    topic.los.forEach((lo) => {
      this.emitLo(lo, topicPath);
    });
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