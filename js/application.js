/* Author: 

*/
var NotesApp = (function(){
	var App = {
		stores: {},
		views: {},
		collections: {}
	}

	// Initialise localStorage Data Store
	App.stores.notes = new Store('notes');

	// Note Model
	var Note = Backbone.Model.extend({
		// Use localStorage data store
		localStorage: App.stores.notes,

		initialize: function(){
			if(!this.get('title')){
				this.set({title: "Note @ " + Date() });
			}

			if(!this.get('body')){
				this.set({body: "No Content"});
			}
		}
	});


	var NoteList = Backbone.Collection.extend({
		model: Note,

		// Set the localStorage Data Store
		localStorage: App.stores.notes,

		initialize: function(){
			var collection = this;

			// when localStorage updates, fetch the data from the store
			this.localStorage.bind('update', function(){
				collection.fetch();
			}, this)
		}
	});

	// Views
	var NewFormView = Backbone.View.extend({
		
		events: {
			"submit form": "createNote"
		},

		createNote: function(e){
			var attrs = this.getAttributes(),
				note = new Note();
			
			note.set(attrs);
			note.save();

			// Stop browser from submitting the form
			e.preventDefault();

			// Stop jQuery mobile from doing its form magic
			e.stopPropagation();

			// Close dialog
			$('.ui-dialog').dialog('close');
			this.reset();
		},

		getAttributes: function(){
			return {
				title: this.$('form [name=title]').val(),
				body: this.$('form [name=body]').val()
			}
		},

		reset: function(){
			// reset all input and textarea fields in the form
			this.$('input, textarea').val('');
		}

	});

	// Represents a listview page displaying a collection of Notes
	// Each item is represented by a NoteListItemView
	var NoteListView = Backbone.View.extend({
		
		initialize: function(){


			// Bind 'this' to mean NoteListView for 
			// each listed function
			_.bindAll(this, 'addOne', 'addAll');

			this.collection.bind('add', this.addOne);
			this.collection.bind('reset', this.addAll);

			this.collection.fetch();
		},

		addOne: function(note){
			var view = new NoteListItemView({model: note});
			$(this.el).append(view.render().el);

			// Check if jQuery Mobile has loaded before 
			// calling listview initialisation
			if('mobile' in $){
				$(this.el).listview().listview('refresh');
			}
		},

		addAll: function(){
			$(this.el).empty();
			this.collection.each(this.addOne);
		}
	});

	var NoteListItemView = Backbone.View.extend({
		tagName: 'LI',
		template: _.template($('#note-list-item-template').html()),

		initialize: function(){
			_.bindAll(this, 'render');
			
			this.model.bind('change', this.render);
		},

		render: function(){
			$(this.el).html(this.template({ note: this.model }));
			return this;
		}
	});

	// Container for NoteDetailView
	// responsible for generating each NoteDetailView
	var NoteDetailListView = Backbone.View.extend({
		// Render NoteDetailViews into this element
		el: $('#note-detail-list'),

		initialize: function(){
			// Make sure all functions execute with correct context
			_.bindAll(this, 'addOne', 'addAll', 'render');

			this.collection.bind('add', this.addOne);
			this.collection.bind('reset', this.addAll);

			this.collection.fetch();
		},

		addOne: function(note){
			var view = new NoteDetailView({model: note});
			$(this.el).append(view.render().el);
			//if($.mobile){
				$.mobile.initializePage();
			//}
		},

		addAll: function(){
			$(this.el).empty();
			this.collection.each(this.addOne);
		}
	});

	//
	// Show Page
	//
	var NoteDetailView = Backbone.View.extend({
		// view based on a tag
		tagName: "DIV",

		// Use a template to interpret values
		template: _.template($('#note-detail-template').html()),

		initialize: function(){
			// make sure render is always called in the correct context
			_.bindAll(this, 'render');

			// Update this Div with jQuery Mobile data-role,
			$(this.el).attr({
				'data-role': 'page',
				'id': "note_" + this.model.id
			});

			// Whenever the model changes, render this view
			this.model.bind('change', this.render);
		},

		// Render the view into this View's element
		render: function(){
			$(this.el).html(this.template({note: this.model}));
			return this;
		}
	});


	window.Note = Note;

	App.collections.all_notes = new NoteList();

	App.views.new_form = new NewFormView({
		el: $('#new')
	});

	App.views.list_alphabetical = new NoteListView({
		el: $('#all_notes'),
		collection: App.collections.all_notes
	});

	// Initialise view for collection of all note details
	App.views.notes = new NoteDetailListView({
		collection: App.collections.all_notes
	});

	return App;
})();

