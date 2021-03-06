var app = module.exports = require('derby').createApp('directory', __filename);
app.serverUse(module, 'derby-stylus');
app.use(require('d-bootstrap'));
app.loadViews(__dirname + '/views');
app.loadStyles(__dirname);
app.component(require('d-connection-alert'));
app.component(require('d-before-unload'));

app.get('/', function(page, model) {
  page.render('home');
});

app.get('/people', function(page, model, params, next) {
  var peopleQuery = model.query('people', {});
  var followQuery = model.at('follow.1');
  model.subscribe(peopleQuery, followQuery, function(err) {
    if (err) return next(err);
    page.render('people');
  });
});

app.get('/people/:id', function(page, model, params, next) {
  if (params.id === 'new') {
    return page.render('edit');
  }
  var person = model.at('people.' + params.id);
  var followQuery = model.at('follow.1');
  model.subscribe(person, followQuery, function(err) {
    if (err) return next(err);
    if (!person.get()) return next();
    model.ref('_page.person', person);
    model.ref('_page.foll', followQuery.at('list'));
    page.render('edit');
  });
});

app.get('/followed', function(page, model, params, next) {
  var followQuery = model.at('follow.1');
  followQuery.subscribe(function(err) {
    var peopleQuery = model.query('people', followQuery.at('list'));
    peopleQuery.subscribe(function(err) {
      if (err) return next(err);
      peopleQuery.ref('_page.people');
      model.ref('_page.foll', followQuery.at('list'));
      page.render('followed');
    });
  });
});

app.proto.isFollowed = function(id, followed) {
  return followed && id && followed.indexOf(id) !== -1;
};

app.component('people:list', PeopleList);
function PeopleList() {}
PeopleList.prototype.init = function(model) {
  model.ref('people', model.root.sort('people', nameAscending));
  this.foll = model.ref('foll', model.root.at('follow.1.list'));
};

PeopleList.prototype.follow = function(id) {
  var follow = this.foll.get()
  if (!follow || follow.indexOf(id) === -1) {
    this.foll.push(id);
  }
};

function nameAscending(a, b) {
  var aName = (a && a.name || '').toLowerCase();
  var bName = (b && b.name || '').toLowerCase();
  if (aName < bName) return -1;
  if (aName > bName) return 1;
  return 0;
}

app.component('edit:form', EditForm);
function EditForm() {}

EditForm.prototype.done = function() {
  var model = this.model;
  if (!model.get('person.name')) {
    var checkName = model.on('change', 'person.name', function(value) {
      if (!value) return;
      model.del('nameError');
      model.removeListener('change', checkName);
    });
    model.set('nameError', true);
    this.nameInput.focus();
    return;
  }

  if (!model.get('person.id')) {
    model.root.add('people', model.get('person'));
  }
  app.history.push('/people');
};

EditForm.prototype.cancel = function() {
  app.history.back();
};

EditForm.prototype.unFollow = function() {
  var id = this.model.get('person.id'),
      followed = this.model.root.get('_page.foll');

  this.model.root.at('_page.foll').remove(followed.indexOf(id));
};

EditForm.prototype.deletePerson = function() {
  // Update model without emitting events so that the page doesn't update
  this.model.silent().del('person');
  app.history.back();
};
