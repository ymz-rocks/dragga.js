/*
 * dragga.js JavaScript Library v1.0
 * Copyright (c) 2016 ymz
 * Released under a Creative Commons Attribution 4.0 International License
 * https://github.com/ymz-rocks/dragga.js/blob/master/LICENSE.md
 */

(function ($)
{
    function Event(element, args, help)
    {
        function Range(min, max)
        {
            this.min = min;
            this.max = max;
            this.unit = new Point();
            this.value = new Point();
            this.position = new Point();

            this.refresh = function (force)
            {
                var pos = element.position(), range = new Point(Math.abs(this.max.x - this.min.x), Math.abs(this.max.y - this.min.y));
                var x = 'x', y = 'y', parent = element.parent(), net = new Point(parent.innerWidth() - element.outerWidth(), parent.innerHeight() - element.outerHeight());

                this.unit.set(net.x / range.x, net.y / range.y);

                if (force) this.position.set(this.value.x * net.x, this.value.y * net.y).round();
                else
                {
                    this.position.set(pos.left, pos.top);
                    this.value.set(pos.left / net.x, pos.top / net.y);
                }

                if (range.valid(x))
                {
                    if (!force) this.value.x = Math.max(Math.min(Math.floor(this.value.x * range.x), this.max.x), 0) + this.min.x;
                    this.position.x = (this.value.x - this.min.x) * this.unit.x;
                }

                if (range.valid(y))
                {
                    if (!force) this.value.y = Math.max(Math.min(Math.floor(this.value.y * range.y), this.max.y), 0) + this.min.y;
                    this.position.y = (this.value.y - this.min.y) * this.unit.y;
                }

                var xy = element.hasClass('xy');

                if (!xy && !element.hasClass(x)) this.value.x = undefined;
                if (!xy && !element.hasClass(y)) this.value.y = undefined;
            }
        }

        function Time(start, end)
        {
            this.start = start;
            this.end = end;
            this.duration = 0;
        }

        function Travel()
        {
            this.from = new Point();
            this.to = new Point();
            this.direction = new Point();
            this.distance = new Point();
            this.velocity = new Point();
        }

        function play(css, interval)
        {
            if (isFinite(interval) && element.filter(':animated').length == 0)
            {
                element.animate(css, interval, 'swing');

                return instance;
            }

            element.css(css); return instance;
        }

        var instance = this;

        this.$ = element;
        this.args = args;
        this.args.e = this;

        this.adjust = function (interval, force)
        {
            var pos = element.position(), dest = new Point(this.range.position.x, this.range.position.y), css = {};

            if (this.range.value.x)
            {
                this.travel.to.x = dest.x;

                if (Math.abs(pos.left - this.range.position.x) > Math.abs(this.range.position.x + this.range.unit.x - pos.left))
                {
                    this.travel.to.x += this.range.unit.x; this.range.value.x++;
                }

                css.left = this.travel.to.x;
            }

            if (this.range.value.y)
            {
                this.travel.to.y = dest.y;

                if (Math.abs(pos.top - this.range.position.y) > Math.abs(this.range.position.y + this.range.unit.y - pos.top))
                {
                    this.travel.to.y += this.range.unit.y; this.range.value.y++;
                }

                css.top = this.travel.to.y;
            }

            if (force || (arguments.length == 1 && help.bool(arguments[0]) && arguments[0])) return play(css, interval);

            return this;
        }

        this.invoke = function (listener)
        {
            if ($.isFunction(this.args[listener])) this.args[listener](this);

            return this;
        }

        this.refresh = function (interval)
        {
            this.range.refresh(true);

            return play({ left: this.range.position.x, top: this.range.position.y }, interval);
        }

        this.reset = function ()
        {
            this.active = false;
            this.user = false;
            this.anchor = new Point();
            this.time = new Time();
            this.travel = new Travel();
            this.range = new Range(new Point(this.args.minX, this.args.minY), new Point(this.args.maxX, this.args.maxY));

            return this;
        }

        this.stop = function ()
        {
            this.active = false;
            this.invoke('end');
        }

        this.update = function (dirX, dirY)
        {
            this.time.end = help.time(); this.time.duration = this.time.end - this.time.start; var time = this.time / 1000;

            this.travel.direction = new Point((this.travel.to.x > this.travel.from.x) ? 1 : -1, (this.travel.to.y > this.travel.from.y) ? 1 : -1),
            this.travel.direction.x *= dirX; this.travel.direction.y *= dirY;
            this.travel.distance.set(Math.abs(this.travel.to.x - this.travel.from.x), Math.abs(this.travel.to.y - this.travel.from.y));
            this.travel.velocity.set(this.travel.distance.x / this.time.duration, this.travel.distance.y / this.time.duration).round();

            this.range.refresh();

            return this;
        }

        this.reset();
    }

    function Functions(elements, help)
    {
        var instance = this;

        function track(events)
        {
            var handle = new Object();

            for (var i in events)
            {
                if (!events[i]) continue;

                elements.each(function ()
                {
                    var $this = $(this), e = help.e($this); if (!e) return;

                    var offset = $this.offset(), space = e.args.space;

                    if (events[i].pageX < offset.left - space || events[i].pageX > offset.left + $this.outerWidth() + space) return;
                    if (events[i].pageY < offset.top - space || events[i].pageY > offset.top + $this.outerHeight() + space) return;

                    if (help.time() - e.time.end < e.args.hold) handle[$this.index()] = events[i];
                });
            }

            return handle;
        }

        this.start = function (element, event, user)
        {
            var e = help.e(element); if (!e) return this;

            var xy = element.hasClass('xy'), pos = element.position();
            var x = (element.hasClass('x') || xy) ? pos.left - event.pageX : undefined;
            var y = (element.hasClass('y') || xy) ? pos.top - event.pageY : undefined;

            e.reset(); e.active = true; e.user = user;
            e.travel.from.set(pos.left, pos.top);
            e.range.position.set(pos.left, pos.top);
            e.time.start = help.time();
            e.anchor.set(x, y);
            e.invoke('start'); if (e.args.lock) instance.end(element);

            return this;
        }

        this.inside = function (element, event, force)
        {
            var e = help.e(element); if (!e || (!e.active && !force)) return this;

            e.travel.to.set(e.anchor.x + event.pageX, e.anchor.y + event.pageY);

            var parent = element.parent();
            var x = Math.max(Math.min(parent.innerWidth() - element.outerWidth(), e.travel.to.x), 0);
            var y = Math.max(Math.min(parent.innerHeight() - element.outerHeight(), e.travel.to.y), 0);

            if (e.travel.to.valid('x')) element.css('left', x);
            if (e.travel.to.valid('y')) element.css('top', y);

            e.update((e.anchor.x == -event.pageX) ? -1 : 1, (e.anchor.y == -event.pageY) ? -1 : 1);

            e.invoke('drag'); return this;
        }

        this.outside = function (events, force)
        {
            var handle = track(events);

            elements.each(function ()
            {
                var $this = $(this), i = $this.index();

                if (handle[i]) return instance.inside($this, handle[i], force);

                instance.end($this);
            });

            return this;
        }

        this.end = function (element, force)
        {
            var e = help.e(element); if (!e) return this;

            if (e.active || force)
            {
                e.invoke('end').active = false;
            }

            return this;
        }

        this.terminate = function ()
        {
            var force = arguments.length == 0;

            var handle = (force) ? null : track(arguments[0]);

            elements.each(function ()
            {
                var $this = $(this);

                if (force) return instance.end($this, true);

                if (handle[$this.index()]) instance.end($this, true);
            });

            return this;
        }
    }

    function Helpers()
    {
        var id = 'data-dragga-id';

        var mobile = function (e)
        {
            return e.originalEvent.targetTouches ? true : false;
        }

        this.active = function (e)
        {
            return (mobile(e)) ? true : e.which == 1;
        }

        this.bool = function (value)
        {
            return typeof value == 'boolean';
        }

        this.e = function (element)
        {
            return map[this.id(element)];
        }

        this.event = function (e)
        {
            return mobile(e) ? e.originalEvent.targetTouches[0] : e;
        }

        this.events = function (e)
        {
            return mobile(e) ? e.originalEvent.targetTouches : [e];
        }

        this.id = function (element, value)
        {
            if (value)
            {
                element.attr(id, value); return value;
            }
            else
            {
                value = element.attr(id); if (isFinite(value)) return value;

                return this.id(element, Math.random() * 10000000 | 0);
            }
        }

        this.reg = function (element, key, events, func)
        {
            var parts = events.split(' '); events = '';

            for (var i in parts)
            {
                events += parts[i] + '.' + key + ' ';
            }

            element.off(events, element.selector)
                   .on(events, element.selector, func);

            return this;
        }

        this.selectable = function (element, enabled)
        {
            if (!element || element.length == 0) return element;
            if (enabled == undefined) enabled = true;

            var mode = (enabled) ? 'text' : 'none';
            var selectstart = 'selectstart';

            element.attr('unselectable', (enabled) ? 'off' : 'on').css('user-select', mode).css('-webkit-touch-callout', mode).css('-webkit-user-select', mode)
                   .css('-khtml-user-select', mode).css('user-select', mode).css('-moz-user-select', mode).css('-ms-user-select', mode);

            this.reg(element, this.id(element), 'selectstart', enabled);
        }

        this.time = function ()
        {
            return new Date().getTime();
        }
    }

    function Point(x, y)
    {
        var valid; this.x = undefined; this.y = undefined;

        this.equals = function (point)
        {
            return (this.x == point.x || this.x == point.left) && (this.y == point.y || this.y == point.top);
        }

        this.round = function ()
        {
            if (this.x) this.x = Math.round(this.x);
            if (this.y) this.y = Math.round(this.y);

            return this;
        }

        this.set = function (x, y)
        {
            valid = new Object();

            if (isFinite(x)) { this.x = x; valid.x = true; }
            if (isFinite(y)) { this.y = y; valid.y = true; }

            return this;
        }

        this.valid = function (axis)
        {
            return valid[axis];
        }

        this.set(x, y);
    }

    function Reg(elements, funcs, help)
    {
        function Args()
        {
            this.e = undefined;

            this.hold = 300;
            this.space = 200;
            this.trigger = true;
            this.lock = false;

            this.minX = undefined;
            this.minY = undefined;
            this.maxX = undefined;
            this.maxY = undefined;

            this.start = function () { }
            this.drag = function () { }
            this.end = function () { }

            this.match = function (classes)
            {
                if (!this.e) return;
                if (!$.isArray(classes)) classes = [classes];

                for (var i in classes)
                {
                    if (this.e.$.hasClass(classes[i])) return classes[i];
                }
            }

            this.refresh = function ()
            {
                if (!isFinite(this.hold)) this.hold = 300;
                if (!isFinite(this.space)) this.space = 200;

                if (isFinite(this.minX)) this.minX |= 0;
                if (isFinite(this.minY)) this.minY |= 0;
                if (isFinite(this.maxX)) this.maxX |= 0;
                if (isFinite(this.maxY)) this.maxY |= 0;

                return this;
            }
        }

        this.args = function (params)
        {
            if ($.isFunction(params))
            {
                this.refresh(params); return;
            }

            return $.extend(new Args(), params).refresh();
        }

        this.drag = function (element, parent)
        {
            function reg(current, force)
            {
                if (current.length == 0) return;

                var type = current[0].tagName.toLowerCase();

                if (type == 'body') current = $(document);

                help.reg(current, key, 'mousemove touchmove', function (e)
                {
                    e.preventDefault(); if (!force) e.stopPropagation();

                    if (help.active(e)) funcs.outside(help.events(e), force);

                }).reg(current, key, 'mouseleave touchend touchcancel', function (e)
                {
                    e.preventDefault(); e.stopPropagation();

                }).reg(current, key, 'mouseup', function (e)
                {
                    e.preventDefault(); if (help.active(e)) funcs.terminate();
                });
            }

            var key = help.id(element);

            help.reg(element, key, 'mousedown touchstart', function (e)
            {
                e.preventDefault(); funcs.start(element, help.event(e), true);

            }).reg(element, key, 'mousemove touchmove', function (e)
            {
                e.preventDefault(); e.stopPropagation(); if (help.active(e)) funcs.inside(element, help.event(e));

            }).reg(element, key, 'mouseup touchend touchcancel', function (e)
            {
                e.preventDefault(); funcs.end(element);
            });

            reg(parent); reg(parent.parent(), true);

            return this;
        }

        this.gesture = function (element, parent)
        {
            var both = 'xy', key = help.id(element);

            if (!element.hasClass(both)) element.addClass(both);

            help.reg(parent, key, 'mousedown touchstart', function (e)
            {
                e.preventDefault();

                element.css({ left: e.pageX, top: e.pageY });

                funcs.start(element, help.event(e), true);

            }).reg(parent, key, 'mousemove touchmove', function (e)
            {
                e.preventDefault(); e.stopPropagation(); if (help.active(e)) funcs.inside(element, help.event(e));

            }).reg(parent, key, 'mouseleave mouseup touchend touchcancel', function (e)
            {
                e.preventDefault(); e.stopPropagation(); funcs.end(element);
            });
        }

        this.refresh = function (invoke, after)
        {
            elements.each(function ()
            {
                var id = help.id($(this));

                if (map[id]) invoke(map[id]);

                if (after) after(map[id]);
            });

            return this;
        }

        this.trigger = function ()
        {
            elements.each(function ()
            {
                var $this = $(this);

                if ($this.hasClass('x') || $this.hasClass('y') || $this.hasClass('xy'))
                {
                    var offset = $this.offset(), e = { pageX: offset.left, pageY: offset.top };

                    funcs.start($this, e).inside($this, e, true).end($this);
                }
            });

            return parent;
        }

        this.update = function (element, parent, args)
        {
            var id = help.id(element);

            element.css('position', 'absolute');

            help.selectable(element, false); help.selectable(parent, false);

            if (parent.css('position') == 'static') parent.css('position', 'relative');

            if (!map[id]) map[id] = new Event(element, $.extend(new Args(), args), help);
            else $.extend(map[id].args, args);

            map[id].refresh(); return this;
        }
    }

    var map = new Object();

    $.fn.dragga = function (params)
    {
        var help = new Helpers();
        var funcs = new Functions(this, help);
        var reg = new Reg(this, funcs, help);

        var args = reg.args(params); if (!args) return;
        var trigger = args.trigger;

        this.each(function ()
        {
            var element = $(this), parent = element.parent(), func = (element.hasClass('x') || element.hasClass('y') || element.hasClass('xy')) ? 'drag' : 'gesture';

            reg.update(element, parent, args)[func](element, parent);
        });

        if ($.isFunction(args.trigger))
        {
            reg.refresh(args.trigger, function (e)
            {
                e.invoke('start').invoke('drag').invoke('end');
            });
        }
        else if (args.trigger)
        {
            reg.trigger();
        }

        return this;
    }

}(jQuery));