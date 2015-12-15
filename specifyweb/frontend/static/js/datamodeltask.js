define([
    'jquery', 'underscore', 'backbone', 'schema', 'router', 'specifyapp'
], function($, _, Backbone, schema, router, app) {
    "use strict";
    var datamodelview = {};

    function attrsToDl(node) {
        var dl = $('<dl class="specify-datamodel-attrs">');
        _(node.attributes).each(function(attr) {
            $('<dt>').text(attr.nodeName).appendTo(dl);
            $('<dd>').text(attr.nodeValue).appendTo(dl);
        });
        return dl;
    }

    datamodelview.SchemaView = Backbone.View.extend({
        __name__: "SchemaView",
        render: function() {
            var self = this;
            self.$el.append('<h2>Specify Schema</h2>');
            var table = $('<table>').appendTo(self.el);
            _(schema.models).each(function(model) {
                table.append('<tr><td><a class="intercept-navigation" href="' + model.name.toLowerCase() + '/">'
                             + model.name + '</a></td></tr>');
            });
            return this;
        }
    });

    datamodelview.DataModelView = Backbone.View.extend({
        __name__: "DataModelView",
        render: function() {
            var self = this, model = schema.getModel(self.options.model);
            self.$el.append('<h2>' + model.name + '</h2>');
            var table = $('<table>').appendTo(self.el);
            _(model.getAllFields()).each(function(field) {
                var tr = $('<tr>');
                tr.append('<td>' + field.name + '</td>');
                tr.append('<td>' + field.type + '</td>');
                if (field.isRelationship) {
                    var related = field.getRelatedModel();
                    tr.append('<td><a class="intercept-navigation" href="../' + related.name.toLowerCase() + '/">'
                              + related.name + '</a></td>');
                } else tr.append('<td>');
                table.append(tr);
            });
            return this;
        }
    });


    return function() {
        function view(model) {
            var View = model ? datamodelview.DataModelView : datamodelview.SchemaView;
            app.setCurrentView(new View({ model: model }));
        }

        router.route('datamodel/:model/', 'datamodel', view);
        router.route('datamodel/', 'datamodel', view);
    };
});
