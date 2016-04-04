/*******************************************
* Theme selecter script for Redmine        *
* Author: Stephane Diemer                  *
*******************************************/

function ThemeSelecter(options) {
    // params
    this.name = "theme_selecter";
    this.base_url = "/";
    // vars
    this.default_language = "en";
    this.translations = {};
    this.$menu = null;
    this.font_sizes = [12, 14, 16, 18, 20, 22, 24];
    this.current_font_size = 12;
    this.themes = [
        { name: "default", label: "White - blue (default)" },
        { name: "black-green", label: "Black - green" },
        { name: "black-blue", label: "Black - blue" },
        { name: "black-purple", label: "Black - purple" },
        { name: "black-brown", label: "Black - brown" }
    ];
    this.current_theme = "default";
    this.current_side_bar = "default";
    this.current_projects_layout = "default";
    this.current_clock_display = "default";
    
    this.allowed_options = [
        "name",
        "base_url"
    ];
    if (options)
        this.set_options(options);
    
    var obj = this;
    $(document).ready(function () {
        obj.init();
    });
    $(document).keydown(function (event) {
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
            "White - blue (default)": "Blanc - bleu (défaut)",
            "Black - green": "Noir - vert",
            "Black - blue": "Noir - bleu",
            "Black - purple": "Noir - violet",
            "Black - brown": "Noir - brun",
            "Fonts": "Police",
            "Font size:": "Taille de la police :",
            "Preview:": "Aperçu :",
            "Exemple text with the font used in all pages.": "Exemple de texte avec la police utilisée dans toutes les pages.",
            "Side bar": "Barre latérale",
            "Default side bar": "Barre latérale par défaut",
            "The side bar will be displayed in every pages.": "La barre latérale sera affichée dans toues les pages.",
            "Adaptative side bar": "Barre latérale adaptative",
            "The side bar will be shorter in tickets pages.": "La barre latérale sera réduite dans les pages des demandes.",
            "Projects page": "Page des projets",
            "Number of columns for projets list:": "Nombre de colonnes utilisées pour l'affichage de la liste des projets :",
            "Clock": "Horloge",
            "Display a clock in every page.": "Afficher une horloge dans toutes les pages.",
            "default": "défaut",
            "apply": "appliquer",
            "Close": "Fermer"
        };
    }
    else
        this.translations = {};
};

ThemeSelecter.prototype.init = function() {
    // set language
    var language = this.default_language;
    if (window.navigator && window.navigator.language)
        language = window.navigator.language.substring(0, 2).toLowerCase();
    else if (window.navigator && window.navigator.userLanguage)
        language = window.navigator.userLanguage.substring(0, 2).toLowerCase();
    this.load_language(language);
    // load theme from cookies
    var theme = this.get_cookie("theme");
    if (theme && theme != "default") {
        this.current_theme = theme;
        // try to get CSS from local storage to avoid color flickering
        if (window.localStorage) {
            if (window.localStorage["css_"+theme]) {
                $("head").append("<style>"+window.localStorage["css_"+theme]+"</style>");
            }
            else {
                // store CSS for next time
                $.ajax({
                    url: this.base_url+"stylesheets/theme-"+theme+".css",
                    dataType: "html",
                    success: function (response) {
                        window.localStorage["css_"+theme] = response;
                    },
                    error: function(xhr, textStatus, thrownError) {
                        console.log("Error when trying to get CSS: "+textStatus+" - "+thrownError);
                        //console.log(xhr.responseText);
                    }
                });
            }
        }
        // add CSS even if it was loaded from local storage to fix images links
        $("head").append("<link href=\""+this.base_url+"stylesheets/theme-"+theme+".css\" rel=\"stylesheet\" type=\"text/css\"/>");
    }
    if (this.current_theme.indexOf("black") != -1)
        $("html").addClass("black-theme");
    else
        $("html").addClass("white-theme");
    // load font size from cookies
    var font_size = parseInt(this.get_cookie("font_size", 0), 10);
    if (!isNaN(font_size) && font_size > 12) {
        this.current_font_size = font_size;
        $("head").append("<style>body { font-size: "+font_size+"px; }</style>");
    }
    // load side bar layout from cookies
    var side_bar = this.get_cookie("side_bar");
    if (side_bar && side_bar != "default") {
        this.current_side_bar = side_bar;
        $("head").append("<link href=\""+this.base_url+"stylesheets/bar-"+side_bar+".css\" rel=\"stylesheet\" type=\"text/css\"/>");
    }
    // load projects page layout from cookies
    var projects_layout = this.get_cookie("projects_layout");
    if (projects_layout && projects_layout != "default") {
        var nb_columns = 1;
        try { nb_columns = parseInt(projects_layout[0], 10); } catch (e) {}
        if (nb_columns > 1) {
            this.current_projects_layout = projects_layout;
            var columns_width = parseInt(100 / nb_columns, 10);
            $("head").append("<style>ul.projects.root { overflow: hidden; } #projects-index ul.projects li.root { float: left; width: "+columns_width+"%; margin-bottom: 2em; }</style>");
        }
    }
    // load clock display from cookies
    var clock_display = this.get_cookie("clock_display");
    if (clock_display && clock_display != "default") {
        this.current_clock_display = clock_display;
        $("body").append("<div id=\"overlay_clock\"></div>");
        this.refresh_clock_display();
    }
    // add selecter button
    $("#top-menu #account ul").append("<li><a class=\"theme-selection-menu\" href=\"javascript: "+this.name+".open_menu();\">"+this.translate("Display settings")+"</a></li>");
};

ThemeSelecter.prototype.open_menu = function() {
    if (!this.$menu) {
        // init menu
        var i, html = "";
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
        
        html += "<div class=\"menu-section\">";
        html +=     "<h2>"+this.translate("Colors")+"</h2>";
        html +=     "<div class=\"menu-content\">";
        for (i=0; i < this.themes.length; i++) {
            var theme = this.themes[i];
            html +=     "<div class=\"skin "+((this.current_theme == theme.name) ? "active" : "")+"\" onclick=\""+this.name+".select_theme('"+theme.name+"')\">";
            html +=         "<h3>"+this.translate(theme.label)+"</h3>";
            html +=     "</div>";
        }
        html +=     "</div>";
        html += "</div>";
        
        html += "<div class=\"menu-section\">";
        html +=     "<h2>"+this.translate("Fonts")+"</h2>";
        html +=     "<div class=\"menu-content\">";
        html +=         "<p style=\"line-height: 32px;\">";
        html +=             "<label for=\"theme_font_size\">"+this.translate("Font size:")+"</label>";
        html +=             " <select id=\"theme_font_size\" onchange=\""+this.name+".font_size_preview();\">";
        for (i=0; i < this.font_sizes.length; i++) {
            var font_size = this.font_sizes[i];
            html +=             "<option value=\""+font_size+"\" style=\"font-size: "+font_size+"px;\" "+((this.current_font_size == font_size) ? "selected=\"selected\"" : "")+">"+font_size+" px"+((i == 0) ? " ("+this.translate("default")+")" : "")+"</option>";
        }
        html +=             "</select>";
        html +=             " <button onclick=\""+this.name+".set_font_size();\">"+this.translate("apply")+"</button> ";
        html +=         "</p>";
        html +=         "<p style=\"line-height: 32px;\">";
        html +=             "<span>"+this.translate("Preview:")+"</span>";
        html +=             " <span id=\"theme_font_preview\" style=\"font: normal "+this.current_font_size+"px Verdana, sans-serif;\">"+this.translate("Exemple text with the font used in all pages.")+"</span>";
        html +=         "</p>";
        html +=     "</div>";
        html += "</div>";
        
        html += "<div class=\"menu-section\">";
        html +=     "<h2>"+this.translate("Side bar")+"</h2>";
        html +=     "<div class=\"menu-content\">";
        html +=         "<div class=\"skin "+((this.current_side_bar == "default") ? "active" : "")+"\" onclick=\""+this.name+".select_side_bar('default')\">";
        html +=            "<h3>"+this.translate("Default side bar")+"</h3>";
        html +=            "<p>"+this.translate("The side bar will be displayed in every pages.")+"</p>";
        html +=         "</div>";
        html +=         "<div class=\"skin "+((this.current_side_bar == "adaptative") ? "active" : "")+"\" onclick=\""+this.name+".select_side_bar('adaptative')\">";
        html +=             "<h3>"+this.translate("Adaptative side bar")+"</h3>";
        html +=             "<p>"+this.translate("The side bar will be shorter in tickets pages.")+"</p>";
        html +=         "</div>";
        html +=     "</div>";
        html += "</div>";
        
        html += "<div class=\"menu-section\">";
        html +=     "<h2>"+this.translate("Projects page")+"</h2>";
        html +=     "<div class=\"menu-content\">";
        html +=         "<p>";
        html +=             "<label for=\"theme_projects_layout\">"+this.translate("Number of columns for projets list:")+"</label>";
        html +=             " <select id=\"theme_projects_layout\">";
        html +=                 "<option value=\"default\" "+((this.current_projects_layout == "default") ? "selected=\"selected\"" : "")+">1 ("+this.translate("default")+")</option>";
        html +=                 "<option value=\"2columns\" "+((this.current_projects_layout == "2columns") ? "selected=\"selected\"" : "")+">2</option>";
        html +=                 "<option value=\"3columns\" "+((this.current_projects_layout == "3columns") ? "selected=\"selected\"" : "")+">3</option>";
        html +=                 "<option value=\"4columns\" "+((this.current_projects_layout == "4columns") ? "selected=\"selected\"" : "")+">4</option>";
        html +=             "</select>";
        html +=             " <button onclick=\""+this.name+".select_projects_layout();\">"+this.translate("apply")+"</button> ";
        html +=         "</p>";
        html +=     "</div>";
        html += "</div>";
        
        html += "<div class=\"menu-section\">";
        html +=     "<h2>"+this.translate("Clock")+"</h2>";
        html +=     "<div class=\"menu-content\">";
        html +=         "<p>";
        html +=             "<input type=\"checkbox\" id=\"theme_clock_display\" "+((this.current_clock_display == "default") ? "" : "checked=\"checked\"")+">";
        html +=             " <label for=\"theme_clock_display\">"+this.translate("Display a clock in every page.")+"</label>";
        html +=             " <button onclick=\""+this.name+".select_clock_display();\">"+this.translate("apply")+"</button> ";
        html +=         "</p>";
        html +=     "</div>";
        html += "</div>";
        
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
    this.current_theme = theme;
    if (theme != "default") {
        this.set_cookie("theme", theme);
        // force download of CSS
        // this allows to refesh CSS in local storage by selecting it
        if (window.localStorage && window.localStorage["css_"+theme])
            delete window.localStorage["css_"+theme];
    }
    else
        this.set_cookie("theme", "");
    window.location.reload();
};
ThemeSelecter.prototype.font_size_preview = function() {
    var font_size = $("#theme_font_size", this.$menu).val();
    $("#theme_font_preview", this.$menu).css("font-size", font_size+"px");
};
ThemeSelecter.prototype.set_font_size = function() {
    this.close_menu();
    var font_size = $("#theme_font_size", this.$menu).val();
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
ThemeSelecter.prototype.select_projects_layout = function() {
    this.close_menu();
    var projects_layout = $("#theme_projects_layout", this.$menu).val();
    if (projects_layout == this.current_projects_layout)
        return;
    
    this.current_projects_layout = projects_layout;
    if (projects_layout != "default")
        this.set_cookie("projects_layout", projects_layout);
    else
        this.set_cookie("projects_layout", "");
    window.location.reload();
};
ThemeSelecter.prototype.select_clock_display = function() {
    this.close_menu();
    var clock_display = $("#theme_clock_display", this.$menu).is(":checked") ? "on" : "default";
    if (clock_display == this.current_clock_display)
        return;
    
    this.current_clock_display = clock_display;
    if (clock_display != "default")
        this.set_cookie("clock_display", clock_display);
    else
        this.set_cookie("clock_display", "");
    window.location.reload();
};


ThemeSelecter.prototype.refresh_clock_display = function() {
    var date = new Date();
    //var y = date.getFullYear();
    //var m = date.getMonth() + 1;
    //var d = date.getDate();
    var H = date.getHours();
    var M = date.getMinutes();
    var S = date.getSeconds();
    //var new_date = (y < 10 ? "0"+y : y)+"/"+(m < 10 ? "0"+m : m)+"/"+(d < 10 ? "0"+d : d);
    var new_hour = (H < 10 ? "0"+H : H)+":"+(M < 10 ? "0"+M : M)+":"+(S < 10 ? "0"+S : S);
    $("#overlay_clock").html(new_hour);
    var obj = this;
    setTimeout(function () {
        obj.refresh_clock_display();
    }, 1000);
};


ThemeSelecter.prototype.get_cookie = function(c_name, c_default) {
    if (document.cookie.length > 0) {
        var c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length+1;
            var c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) c_end = document.cookie.length;
            return window.unescape(document.cookie.substring(c_start, c_end));
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
    document.cookie = c_name+"="+window.escape(value)+"; expires="+exdate.toUTCString()+"; path=/";
};


// init
var theme_selecter = new ThemeSelecter({
    name: "theme_selecter",
    base_url: "/themes/redmine-multi-theme/"
});
