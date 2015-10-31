// taken from: https://github.com/BruceSherwood/glowscript/blob/master/lib/glow/api_misc.js

String.prototype.format = function(args) {
    // Inspired by the formatting function presented at www.npmjs.com/package/python-format by
    // x.fix@o2.pl (@glitchmr on npm), which included the very useful list of Python format codes.

    function format_item(arg, op, first, second) {
        // in ':2.1f", first is 2, second is 1, op is f

        function pad(s, first) {
            var p = ''
            for (var i = 0; i < first - s.length; i++) p += ' '
            return p + s
        }

        var formats = {
            b: function() {
                return pad(arg.toString(2), first)
            },
            c: function() {
                return pad(String.fromCharCode(arg), first)
            },
            d: function() {
                return pad(Math.floor(Math.round(arg)).toString(), first)
            },
            e: function() {
                var v = pad(arg.toExponential(second || 6), first)
                var eloc = v.search('e')
                var exponent = v.slice(eloc)
                v = v.slice(0, eloc)
                if (exponent.length == 3) exponent = exponent.slice(0, 2) + '0' + exponent.slice(-1)
                return v + exponent
            },
            E: function() {
                return formats.e()
            },
            f: function() {
                if (second == 0) second = 6
                else if (second == -1) second = 0
                return pad(arg.toFixed(second), first)
            },
            F: function() {
                return formats.f()
            },
            g: function() {
                if (arg == 0) return '0'
                if (second == 0) second = 6
                var a = Math.abs(arg)
                var v
                if (1e-4 <= a && a < Math.pow(10, second)) {
                    if (a < 0.1) { // between 1e-4 and 1e-2 Python writes e.g. 0.00123
                        var etype = arg.toExponential(second)
                        etype = etype.replace('.', '')
                        var eloc = etype.search('e')
                        var exponent = etype.slice(eloc + 2)
                        var val = etype.slice(0, eloc)
                        var length = val.length
                        if (arg < 0) {
                            length++
                            second++
                        }
                        if (length > second) val = val.slice(0, second)
                        var sign = ''
                        if (val.slice(0, 1) == '-') {
                            sign = '-'
                            val = val.slice(1)
                        }
                        v = val.slice(0, second)
                        while (v.slice(-1) == '0') v = v.slice(0, -1)
                        if (exponent == 2) return sign + '0.0' + v
                        else if (exponent == 3) return sign + '0.00' + v
                        else return sign + '0.000' + v // exponent must be 4
                    } else {
                        if (a >= 1) second--
                            v = formats.e()
                        var eloc = v.search('e')
                        var exponent = Number(v.slice(eloc + 1))
                        var val = Number(v.slice(0, eloc))
                        arg = val * pow(10, exponent)
                        v = formats.f()
                        while (v.slice(-1) == '0') v = v.slice(0, -1)
                        if (v.slice(-1) == '.') v = v.slice(0, -1)
                        return v
                    }
                } else {
                    second--
                    v = formats.e()
                    var eloc = v.search('e')
                    var exponent = v.slice(eloc)
                    v = v.slice(0, eloc)
                    while (v.slice(-1) == '0') v = v.slice(0, -1)
                    if (v.slice(-1) == '.') v = v.slice(0, -1)
                    return v + exponent
                }
            },
            G: function() {
                return formats.g().toUpperCase()
            },
            n: function() {
                return formats.g()
            },
            o: function() {
                return pad(arg.toString(8), first)
            },
            s: function() {
                var t = arg.slice(0, second)
                for (var i = 0; i < first - second; i++) t += ' '
                return (t)
            },
            x: function() {
                return pad(arg.toString(16), first)
            },
            X: function() {
                return formats.x().toUpperCase()
            },
            '%': function() {
                arg *= 100
                return formats.f() + '%'
            }
        }
        return formats[op]()
    }

    var s = this
    var values = Array.prototype.slice.call(arguments)
    var substrings = [] // accumulate a list of strings between {...}
    var formats = [] // and a list of formats when found between braces, e.g. {:2.3f}
    var braces = /(\{[^\}]*\})/g
    var start = 0
    while (true) {
        var m = braces.exec(s) // look for {...}
        if (m === null) {
            substrings.push(s.slice(start))
            break
        }
        var format = s.slice(m.index + 1, braces.lastIndex - 1)
        formats.push(format.replace(/\s*/g, ''))
        substrings.push(s.slice(start, m.index))
        start = braces.lastIndex
    }

    // Now assemble the substrings and formatted values
    var t = ''
    for (var i = 0; i < substrings.length; i++) {
        t += substrings[i]
        if (i >= formats.length) break
        var f = formats[i]
        var findex = i // default position in argument list
        var colon = f.search(':')
        if (colon < 0) {
            if (f.length > 0 && f.slice(-1).match(/[a-z]/) !== null) // check for missing colon
                throw new Error('Format error: missing ":" in "{' + f + '}"')
            if (f.match(/\./) !== null)
                throw new Error('Format error: should not have "." in "{' + f + '}"')
            if (f.length > 0) findex = Number(f) // case of {3}
            t += values[findex].toString()
        } else { // ":" indicates format such as {3:5.2f}
            var op = f.slice(-1)
            if (op.match(/[a-z]/) === null)
                throw new Error('Format error: final character in "{' + f + '}" must be a letter.')
            if (colon > 0) findex = Number(f.slice(0, colon)) // extract index 3 from "3:5.2f"
            f = f.slice(colon + 1)
            var period = f.search(/\./)
            var first, second // in ':5.2f", first is 5, second is 2, op is f
            if (period >= 0) {
                first = f.slice(0, period)
                if (first == '') first = 0
                else first = Number(first)
                second = Number(f.slice(period + 1, -1))
                if (second === 0) second = -1 // represents that the 0 was explicit
            } else {
                first = (f.length >= 2) ? Number(f.slice(0, -1)) : 0
                second = 0 // represents an implicit 0
            }
            t += format_item(values[findex], op, first, second)
        }
    }
    return t
}
