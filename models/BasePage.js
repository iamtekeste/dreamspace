var keystone = require('keystone');
var Types = keystone.Field.Types;
var NestedSetPlugin = require('mongoose-nested-set');

/**
 * BasePage Model
 * ==========
 */

var BasePage = new keystone.List('BasePage', {
  map: { name: 'name' },
  autokey: { path: 'slug', from: 'title', unique: true },
  sortable: true,
  sortContext: 'BasePage:childPages',
  track: true
});

BasePage.add({
    name: { type: String, required: true },
    title: { type: String, required: true, initial: true },
    slug: { type: String },
    fullPath: { type: String, noedit: true },
    author: { type: Types.Relationship, ref: 'User', index: true },
    state: { type: Types.Select, options: 'draft, published, archived', default: 'draft', index: true },
    publishedDate: { type: Types.Datetime, index: true, default: Date.now, dependsOn: { state: 'published' } },
    metaDescription: { type: String, collapse: true },
    metaKeywords: { type: String, collapse: true },
});

BasePage.add(
    {
        heading: 'Nav'
    },
    {
        parentId: { type: Types.Relationship, ref: 'BasePage', index: true, initial: true },
    }
);

BasePage.add(
    {
        heading: 'Hero',
    },
    {
        hasHero: {
            type: Types.Boolean,
            default: false
        },
        heroTitle: {
            type: String,
            collapse: true,
            dependsOn: { hasHero: true }
        },
        heroDescription: {
            type: String,
            collapse: true,
            dependsOn: { hasHero: true }
        },
        heroButtonText: {
            type: String,
            collapse: true,
            dependsOn: { hasHero: true }
        },
        heroButtonUrl: {
            type: String,
            collapse: true,
            dependsOn: { hasHero: true }
        },
    }
);

BasePage.add(
    'Blocks',
    {
        blocks: { type: Types.Relationship, ref: 'ContentBlock', many: true }
    }
);

BasePage.schema.virtual('href').get(function() {
    return this.fullPath;
});

BasePage.schema.plugin(NestedSetPlugin);
BasePage.defaultColumns = 'name, title, state';

BasePage.register();

BasePage.schema.pre('save', function(next) {
  var thisPage = this;
  var thisBasePage = BasePage.model(this);
  if(String(thisBasePage._id) === String(thisBasePage.parentId)) {
    return next(new Error('Page Parent can not be set to itself'));
  }
  BasePage.model.rebuildTree(thisBasePage, 1, function() {
    thisBasePage.parent(function(err, parentNode) {
      if (parentNode) {
        thisPage.fullPath = parentNode.fullPath + thisPage.slug + '/';
      } else {
        thisPage.fullPath = '/' + thisPage.slug + '/';
      }
      next();
    });
  });
});

module.exports = BasePage;
