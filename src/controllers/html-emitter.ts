 import * as sh from 'shelljs';

import { Course } from '@tutors-sdk/tutors-lib/src/models/course';
import { writeFile } from '@tutors-sdk/tutors-lib/src/utils/futils';
import { Topic, Unit } from '@tutors-sdk/tutors-lib/src/models/topic';
import { Lab } from '@tutors-sdk/tutors-lib/src/models/lab';
import { MarkdownParser } from './markdown-parser';
import { LearningObject } from '@tutors-sdk/tutors-lib/src/models/lo';

const nunjucks = require('nunjucks');

export function publishTemplate(path: string, file: string, template: string, lo: any): void {
  writeFile(path, file, nunjucks.render(template, { lo: lo }));
}

export class HtmlEmitter {
  parser = new MarkdownParser();

  emitObjectves(lo: LearningObject) {
    if (lo.objectivesMd) lo.objectives = this.parser.parse(lo.objectivesMd);
  }

  emitLab(lab: Lab, path: string) {
    lab.chapters.forEach((chapter) => {
      chapter.content = this.parser.parse(chapter.contentMd);
    });
    const labPath = path + '/' + lab.folder;
    publishTemplate(labPath, 'index.html', 'lab.njk', lab);
  }

  emitUnit(unit: Unit, path: string) {
    unit.los.forEach((lo) => {
      this.emitObjectves(lo);
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
      this.emitObjectves(lo);
    }
  }

  emitTopic(topic: Topic, path: string) {
    sh.cd(topic.folder);
    this.emitObjectves(topic);
    const topicPath = path + '/' + topic.folder;
    topic.los.forEach((lo) => {
      this.emitLo(lo, topicPath);
    });
    publishTemplate(topicPath, 'index.html', 'topic.njk', topic);
    sh.cd('..');
  }

  emitCourse(course: Course, path: string) {
    course.los.forEach((lo) => {
      this.emitTopic(lo as Topic, path);
    });
    publishTemplate(path, 'index.html', 'course.njk', course);
    course.walls.forEach((loWall) => {
      if (loWall.los.length > 0) {
        publishTemplate(path, '/' + loWall.los[0].lotype + 'wall.html', 'wall.njk', loWall);
      }
    });
  }

  generateCourse(path: string, course: Course) {
    sh.cd (path);
    this.emitCourse(course, path);
  }
}
