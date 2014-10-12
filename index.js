var benml = function (text) {
    text = text.replace(/</g, '&lt;');  // Escape HTML tags.

    var inlineRules = {}
    var blockRules = {}

    // Escape
    inlineRules[/\\([\<\>\*\\])/] = function (m) {
        return m[1];
    };

    // Links
    inlineRules[/&lt;([a-z0-9:\.-]+?)>/] = function (m) {
        return '<a href="' + m[1] + '" class="tag">' + m[1] + '</a>';
    };
    inlineRules[/&lt;([a-z0-9:\/\.-]+)\s([^>]+)>/] = function (m) {
        var text = lexer(m[2], inlineRules);
        return '<a href="' + m[1] + '">' + text + '</a>';
    };

    // Emphasis
    inlineRules[/\*(.+)\*/] = function (m) {
        return '<em>' + lexer(m[1], inlineRules) + '</em>';
    };

    // Inline code
    inlineRules[/`([^`]+)`/] = function (m) {
        return '<code>' + m[1] + '</code>';
    };

    // Em dash
    inlineRules[/--/] = function (m) {
        return '\u2014';
    };

    // Ellipsis
    inlineRules[/\.{3}/] = function (m) {
        return '\u2026';
    }

    // Block code
    blockRules[/```([\s\S]+?)```/] = function (m) {
        return '<pre>' + m[1] + '</pre>';
    };

    // Lists
    blockRules[/([^\n]*\n\s*-+)+\s+[^\n]+/] = function (m) {
        var items = m[0].trim().split('\n');
        var prevIndent = 0;
        var html = '';
        var uls = 0;
        for (var i = 0; i < items.length; i++) {
            var indent = items[i].match(/^-+/)[0].length;
            var content = lexer(items[i].replace(/^-+\s+/, ''), inlineRules);
            if (indent > prevIndent) {
                html += '<ul>';
                uls++;
            } else if (indent < prevIndent) {
                html += '</ul>';
                uls--;
            }
            html += '<li>' + content;
            prevIndent = indent;
        }
        while (uls--) html += '</ul>';
        return html;
    }

    return lexer(text, blockRules, inlineRules);
};

var lexer = function (source) {
    var rules = Array.prototype.slice.call(arguments, 1);
    var tokens = [];
    var out = '';

    // Tokenize
    while (source) {
        var match = false;

        for (var i = 0; i < rules.length; ++i) {
            for (var rule in rules[i]) {
                var regex = rule.split('/').slice(1, -1).join('/');
                var pattern = new RegExp('^' + regex, 'i');
                match = pattern.exec(source);
                if (match) {
                    source = source.substring(match[0].length);
                    tokens.push({
                        rule: rule,
                        replacement: rules[i][rule](match)
                    });
                    break;
                }
            }
            if (match) break;
        }

        // No match
        if (!match) {
            tokens.push({
                rule: 'unmatched',
                replacement: source[0]
            });
            source = source.substring(1);
        }
    }

    // Render
    for (var i = 0; i < tokens.length; i++) {
        out += tokens[i].replacement;
    }
    return out;

};

module.exports = benml;
