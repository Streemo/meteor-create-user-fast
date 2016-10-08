Package.describe({
  name: 'streemo:create-user-fast',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Accounts.createUser without the case-insensitive checks.',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/Streemo/create-user-fast.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.4.1.1');
  api.use(['ecmascript','random',"check","accounts-base","sha"], 'server')
  api.addFiles('createUser.js','server')
});

Npm.depends({
  bcrypt:"0.8.7"
})