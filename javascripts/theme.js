/*******************************************
* Theme selecter script for Redmine        *
* Author: Stephane Diemer                  *
*******************************************/

function ThemeSelecter(options) {
    // params
    this.name = "theme_selecter";
    this.language = "en";
    this.base_url = "/";
    // vars
    this.translations = {};
    this.font_sizes = [12, 14, 16, 18, 20, 22, 24];
    this.themes_names = ["default", "black-green", "black-blue", "black-purple", "black-brown"];
    this.$menu = null;
    this.current_theme = "default";
    this.current_font_size = 12;
    this.current_side_bar = "default";
    
    this.allowed_options = [
        "name",
        "language",
        "base_url"
    ];
    if (options)
        this.set_options(options);
    
    var obj = this;
    $(document).ready(function () {
        obj.init();
    });
    $(window).keypress(function (event) {
        if (event.keyCode == 27)
            obj.close_menu();
    });
}

ThemeSelecter.prototype.set_options = function (options) {
    for (var i = 0; i < this.allowed_options.length; i++) {
        if (this.allowed_options[i] in options)
            this[this.allowed_options[i]] = options[this.allowed_options[i]];
    }
};
ThemeSelecter.prototype.translate = function (text) {
    if (text in this.translations)
        return this.translations[text];
    return text;
};
ThemeSelecter.prototype.load_language = function(language) {
    if (language == "fr") {
        this.translations = {
            "Display settings": "Paramètres d'apparence",
            "Colors": "Couleurs",
            "Fonts": "Police",
            "Side bar": "Barre latérale",
            "Font size:": "Taille de la police :",
            "Exemple text with the font used in all pages.": "Exemple de texte avec la police utilisée dans toutes les pages.",
            "Default side bar": "Barre latérale par défaut",
            "The side bar will be displayed in every pages.": "La barre latérale sera affichée dans toues les pages.",
            "Adaptative side bar": "Barre latérale adaptative",
            "The side bar will be shorter in tickets pages.": "La barre latérale sera réduite dans les pages des demandes.",
            "default": "défaut",
            "Close": "Fermer"
        };
    }
    else
        this.translations = {};
};

ThemeSelecter.prototype.init = function() {
    // set language
    this.load_language(this.language);
    // load theme from cookies
    var theme = this.get_cookie("theme");
    if (theme) {
        $("head").append("<link href=\""+this.base_url+"stylesheets/theme-"+theme+".css\" rel=\"stylesheet\" type=\"text/css\"/>");
        this.current_theme = theme;
    };
    if (this.current_theme.indexOf("black") != -1)
        $("body").addClass("black-theme");
    else
        $("body").addClass("white-theme");
    // load font size from cookies
    var font_size = parseInt(this.get_cookie("font_size", 0), 10);
    if (!isNaN(font_size) && font_size > 12) {
        var css = "body { font-size: "+font_size+"px; }";
        css += " h1, .wiki h1 { font-size: 175%; }";
        css += " h2, .wiki h2 { font-size: 150%; }";
        css += " h3, .wiki h2 { font-size: 125%; }";
        css += " h4, .wiki h4 { font-size: 100%; }";
        css += " h5, .wiki h5 { font-size: 100%; }";
        $("head").append("<style>"+css+"</style>");
        this.current_font_size = font_size;
    }
    // load side bar from cookies
    var side_bar = this.get_cookie("side_bar");
    if (side_bar) {
        $("head").append("<link href=\""+this.base_url+"stylesheets/bar-"+side_bar+".css\" rel=\"stylesheet\" type=\"text/css\"/>");
        this.current_side_bar = side_bar;
    }
    // add selecter button
    $("#top-menu #account ul").append("<li><a class=\"theme-selection-menu\" href=\"javascript: "+this.name+".open_menu();\">"+this.translate("Display settings")+"</a></li>");
};

ThemeSelecter.prototype.open_menu = function() {
    if (!this.$menu) {
        // init menu
        var html = "";
        html += "<div id=\"theme_menu\">";
        html +=     "<div id=\"theme_menu_bg\">";
        html +=         "<table id=\"theme_menu_aligner\"><tr><td>";
        html +=             "<div id=\"theme_menu_window\">";
        html +=                 "<div id=\"theme_menu_window_bg\">";
        html +=                     "<div id=\"theme_menu_title\">";
        html +=                         "<h1>"+this.translate("Display settings")+"</h1>";
        html +=                         "<div id=\"theme_menu_close\" onclick=\""+this.name+".close_menu()\" title=\""+this.translate("Close")+"\">X</div>";
        html +=                     "</div>";
        html +=                     "<div id=\"theme_menu_content\">";
        html +=                         "<div class=\"menu-section\">";
        html +=                             "<h2>"+this.translate("Colors")+"</h2>";
        html +=                             "<div class=\"menu-content\">";
        for (var i=0; i < this.themes_names.length; i++) {
            var theme_name = this.themes_names[i];
            html +=                             "<div class=\"skin "+((this.current_theme == theme_name) ? "active" : "")+"\" onclick=\""+this.name+".select_theme('"+theme_name+"')\">";
            html +=                                 "<h3>"+theme_name+"</h3>";
            html +=                             "</div>";
        }
        html +=                             "</div>";
        html +=                         "</div>";
        html +=                         "<div class=\"menu-section\">";
        html +=                             "<h2>"+this.translate("Fonts")+"</h2>";
        html +=                             "<div class=\"menu-content\">";
        html +=                                 "<p style=\"line-height: 26px;\">";
        html +=                                     "<label for=\"theme_font_size\">"+this.translate("Font size:")+"</label> ";
        html +=                                     "<select id=\"theme_font_size\" onchange=\""+this.name+".font_size_preview();\">";
        for (var i=0; i < this.font_sizes.length; i++) {
            var font_size = this.font_sizes[i];
            html +=                                     "<option value=\""+font_size+"\" style=\"font-size: "+font_size+"px;\" "+((this.current_font_size == font_size) ? "selected=\"selected\"" : "")+">"+font_size+" px"+((i == 0) ? " ("+this.translate("default")+")" : "")+"</option>";
        }
        html +=                                     "</select> ";
        html +=                                     "<button onclick=\""+this.name+".set_font_size();\">"+this.translate("Use")+"</button> ";
        html +=                                 "</p>";
        html +=                                 "<p id=\"theme_font_preview\" style=\"font: normal "+this.current_font_size+"px Verdana, sans-serif;\">";
        html +=                                     this.translate("Exemple text with the font used in all pages.");
        html +=                                 "</p>";
        html +=                             "</div>";
        html +=                         "</div>";
        html +=                         "<div class=\"menu-section\">";
        html +=                             "<h2>"+this.translate("Side bar")+"</h2>";
        html +=                             "<div class=\"menu-content\">";
        html +=                                 "<div class=\"skin "+((this.current_side_bar == "default") ? "active" : "")+"\" onclick=\""+this.name+".select_side_bar('default')\">";
        html +=                                    "<h3>"+this.translate("Default side bar")+"</h3>";
        html +=                                    "<p>"+this.translate("The side bar will be displayed in every pages.")+"</p>";
        html +=                                 "</div>";
        html +=                                 "<div class=\"skin "+((this.current_side_bar == "adaptative") ? "active" : "")+"\" onclick=\""+this.name+".select_side_bar('adaptative')\">";
        html +=                                     "<h3>"+this.translate("Adaptative side bar")+"</h3>";
        html +=                                     "<p>"+this.translate("The side bar will be shorter in tickets pages.")+"</p>";
        html +=                                 "</div>";
        html +=                             "</div>";
        html +=                         "</div>";
        html +=                     "</div>";
        html +=                 "</div>";
        html +=             "</div>";
        html +=         "</td></tr></table>";
        html +=     "</div>";
        html += "</div>";
        this.$menu = $(html);
        $("body").append(this.$menu);
    }
    this.$menu.addClass("visible");
};
ThemeSelecter.prototype.close_menu = function() {
    if (this.$menu)
        this.$menu.removeClass("visible");
};
ThemeSelecter.prototype.select_theme = function(theme) {
    this.close_menu();
    if (theme == this.current_theme)
        return;
    
    this.current_theme = theme;
    if (theme != "default")
        this.set_cookie("theme", theme);
    else
        this.set_cookie("theme", "");
    window.location.reload();
};
ThemeSelecter.prototype.font_size_preview = function() {
    var font_size = $("#theme_font_size", this.$menu).val();
    console.log("font: "+font_size);
    $("#theme_font_preview", this.$menu).css("font-size", font_size+"px");
};
ThemeSelecter.prototype.set_font_size = function() {
    this.close_menu();
    if (font_size == this.current_font_size)
        return;
    
    var font_size = $("#theme_font_size", this.$menu).val();
    this.current_font_size = font_size;
    if (font_size > 12)
        this.set_cookie("font_size", font_size);
    else
        this.set_cookie("font_size", "");
    window.location.reload();
};
ThemeSelecter.prototype.select_side_bar = function(side_bar) {
    this.close_menu();
    if (side_bar == this.current_side_bar)
        return;
    
    this.current_side_bar = side_bar;
    if (side_bar != "default")
        this.set_cookie("side_bar", side_bar);
    else
        this.set_cookie("side_bar", "");
    window.location.reload();
};


ThemeSelecter.prototype.get_cookie = function(c_name, c_default) {
    if (document.cookie.length > 0) {
        var c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length+1;
            var c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) c_end = document.cookie.length;
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    if (c_default !== undefined)
        return c_default;
    return "";
};
ThemeSelecter.prototype.set_cookie = function(c_name, value, expiredays) {
    var exdate = new Date();
    if (expiredays)
        exdate.setDate(exdate.getDate() + expiredays);
    else
        exdate.setDate(exdate.getDate() + 360);
    document.cookie = c_name+"="+escape(value)+"; expires="+exdate.toUTCString()+"; path=/";
};


// init
var theme_selecter = new ThemeSelecter({
    name: "theme_selecter",
    language: "fr",
    base_url: "/themes/multi-theme"
});

