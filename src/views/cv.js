import cv from '../../content/cv.json' with { type: 'json' };
import { assetUrl } from '../lib/assets.js';

export function cvPage(lang) {
  return cv[lang].replace(/\/assets\/cv\.(css|js)|\/assets\/cv-portrait\.jpg|\/assets\/Javier_Traver_(?:CV_ES|Resume_EN)\.pdf/g, path => assetUrl(path));
}
