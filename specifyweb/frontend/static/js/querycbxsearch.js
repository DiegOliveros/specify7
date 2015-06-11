define([
    'require', 'jquery', 'underscore', 'backbone', 'specifyform', 'specifyapi', 'dataobjformatters', 'whenall',
    'text!context/app.resource?name=DialogDefs!noinline'
], function (require, $, _, Backbone, specifyform, api, dataobjformatters, whenAll, dialogdefxml) {
    "use strict";

    function format(obj) { return dataobjformatters.format(obj); }

    var dialogdefs = $.parseXML(dialogdefxml);

    return Backbone.View.extend({
        __name__: "QueryCbxSearch",
        className: "querycbx-dialog-search",
        events: {
            'click .querycbx-search-results a': 'select'
        },
        initialize: function(options) {
            this.forceCollection = options.forceCollection || null;
        },
        render: function() {
            var dialogDef = $('dialog[type="search"][name="' + this.model.specifyModel.searchDialog + '"]', dialogdefs);
            specifyform.buildViewByName(dialogDef.attr('view'), 'form', 'search').done(_.bind(this.makeDialog, this));
            return this;
        },
        makeDialog: function(form) {
            require("populateform")(form, this.model);
            form.find('.specify-form-header, input[value="Delete"], :submit').remove();
            form.find('.specify-required-field').removeClass('specify-required-field');
            this.$el.append(form).append('<ul class="querycbx-search-results">');
            this.$el.dialog({
                title: 'Search',
                width: 'auto',
                buttons: [
                    {
                        text: "Search",
                        click: _.bind(this.search, this)
                    },
                    {
                        text: "Cancel",
                        click: function() { $(this).dialog("close"); }
                    }
                ],
                close: function() { $(this).remove(); }
            });
        },
        search: function() {
            this.$('.querycbx-search-results').empty();
            api.queryCbxExtendedSearch(this.model, this.forceCollection).done(this.gotResults.bind(this));
        },
        gotResults: function(results) {
            this.results = results;
            whenAll(results.map(format)).done(this.displayResults.bind(this));
        },
        displayResults: function(formattedResults) {
            var items = _.map(formattedResults, function(formattedResult) {
                return $('<li>').append($('<a>').text(formattedResult))[0];
            });
            this.$('.querycbx-search-results').append(items);

            if (formattedResults.length < 1) this.$('.querycbx-search-results').append('<li>No hits</li>');
            if (formattedResults.length > 9) this.$('.querycbx-search-results').append('<li>...</li>');
        },
        select: function(evt) {
            evt.preventDefault();
            var index = this.$('.querycbx-search-results a').index(evt.currentTarget);
            this.options.selected(this.results.at(index));
            this.$el.dialog('close');
        }
    });
});
