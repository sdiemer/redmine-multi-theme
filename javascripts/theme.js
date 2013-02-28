/*******************************************
* Theme selecter script for Redmine        *
* Author: Stephane Diemer                  *
*******************************************/

function ThemeSelecter(options) {
    // params
    this.name = "theme_selecter";
    this.language = "en";
    this.base_url = "";
    // vars
    this.translations = {};
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
            "Choose %s theme": "Choisir le thème %s",
            "Choose 12px font (default)": "Choisir la police 12px (défaut)",
            "Choose 15px font": "Choisir la police 15px",
            "Exemple text with the font used in all pages.": "Exemple de texte avec la police utilisée dans toutes les pages.",
            "Default side bar": "Barre latérale par défaut",
            "The side bar will be displayed in every pages.": "La barre latérale sera affichée dans toues les pages.",
            "Adaptative side bar": "Barre latérale adaptative",
            "The side bar will be shorter in tickets pages.": "La barre latérale sera réduite dans les pages des demandes.",
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
        $("head").append("<link href=\""+this.base_url+"/stylesheets/theme-"+theme+".css\" rel=\"stylesheet\" type=\"text/css\"/>");
        this.current_theme = theme;
    };
    // load font size from cookies
    var font_size = parseInt(this.get_cookie("font_size", 0), 10);
    if (!isNaN(font_size) && font_size > 12) {
        $("head").append("<style> body { font-size: "+font_size+"px; } </style>");
        this.current_font_size = font_size;
    }
    // load side bar from cookies
    var side_bar = this.get_cookie("side_bar");
    if (side_bar) {
        $("head").append("<link href=\""+this.base_url+"/stylesheets/bar-"+side_bar+".css\" rel=\"stylesheet\" type=\"text/css\"/>");
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
        html +=                         "<div>";
        html +=                             "<h2>"+this.translate("Colors")+"</h2>";
        html +=                             "<div class=\"paragraph\">";
        for (var i=0; i < this.themes_names.length; i++) {
            var theme_name = this.themes_names[i];
            var label = this.translate("Choose %s theme").replace(new RegExp("%s", "g"), theme_name);
            html +=                             "<div class=\"skin "+((theme_name == this.current_theme) ? "active": "")+"\" onclick=\""+this.name+".select_theme('"+theme_name+"')\">";
            html +=                                 "<h3>"+label+"</h3>";
            html +=                             "</div>";
        }
        html +=                             "</div>";
        html +=                         "</div>";
        html +=                         "<div>";
        html +=                             "<h2>"+this.translate("Fonts")+"</h2>";
        html +=                             "<div class=\"paragraph\">";
        html +=                                 "<div class=\"skin\" onclick=\""+this.name+".select_font_size(12)\">";
        html +=                                     "<h3>"+this.translate("Choose 12px font (default)")+"</h3>";
        html +=                                     "<p style=\"font: normal 12px Verdana, sans-serif;\">";
        html +=                                         this.translate("Exemple text with the font used in all pages.");
        html +=                                     "</p>";
        html +=                                 "</div>";
        html +=                                 "<div class=\"skin\" onclick=\""+this.name+".select_font_size(15)\">";
        html +=                                     "<h3>"+this.translate("Choose 15px font")+"</h3>";
        html +=                                     "<p style=\"font: normal 15px Verdana, sans-serif;\">";
        html +=                                         this.translate("Exemple text with the font used in all pages.");
        html +=                                     "</p>";
        html +=                                 "</div>";
        html +=                             "</div>";
        html +=                         "</div>";
        html +=                         "<div>";
        html +=                             "<h2>"+this.translate("Side bar")+"</h2>";
        html +=                             "<div class=\"paragraph\">";
        html +=                                 "<div class=\"skin\" onclick=\""+this.name+".select_side_bar('default')\">";
        html +=                                    "<h3>"+this.translate("Default side bar")+"</h3>";
        html +=                                    "<p>"+this.translate("The side bar will be displayed in every pages.")+"</p>";
        html +=                                 "</div>";
        html +=                                 "<div class=\"skin\" onclick=\""+this.name+".select_side_bar('adaptative')\">";
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
ThemeSelecter.prototype.select_font_size = function(font_size) {
    this.close_menu();
    if (font_size == this.current_font_size)
        return;
    
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

