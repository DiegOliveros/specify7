define([
    'jquery', 'underscore', 'backbone', 'schema', 'domain'
], function($, _, Backbone, schema, domain) {
    "use strict";
    var treesForAll = ['geography', 'storage', 'taxon'];
    var treesForPaleo = ['geologictimeperiod', 'lithostrat'];
    var paleoDiscs = 'paleobotany invertpaleo vertpaleo'.split(' ');


     var treesPromise = domain.levels.discipline.rget('type').pipe(function(type) {
         return treesForAll.concat(_.contains(paleoDiscs, type) ? treesForPaleo : []);
     });

    var TreeListDialog = Backbone.View.extend({
        __name__: "TreeListDialog",
        className: "trees-dialog table-list-dialog",
        _render: function(trees) {
            var entries = _.map(trees, this.dialogEntry, this);
            var table = $('<table>').append(entries).appendTo(this.el);
            this.$el.dialog({
                title: 'Trees',
                modal: true,
                close: function() { $(this).remove(); },
                buttons: [{ text: 'Cancel', click: function() { $(this).dialog('close'); } }]
            });
        },
        render: function() {
            treesPromise.done(this._render.bind(this));
            return this;
        },
        dialogEntry: function(tree) {
            var model = schema.getModel(tree);
            var img = $('<img>', { src: model.getIcon() });
            var link = $('<a>', {href: '/specify/tree/' + tree + '/'})
                    .addClass("intercept-navigation")
                    .text(model.getLocalizedName());
            return $('<tr>').append($('<td>').append(img), $('<td>').append(link))[0];
        }
    });

    return {
        task: 'tree',
        title: 'Trees',
        icon: '/images/Tree32x32.png',
        execute: function() {
            new TreeListDialog().render();
        }
    };
});
