// @ts-nocheck
import { useEffect } from 'react';

const useCanvasCursor = (containerId) => {
    function n(e) {
        this.init(e || {});
    }
    n.prototype = {
        init: function (e) {
            this.phase = e.phase || 0;
            this.offset = e.offset || 0;
            this.frequency = e.frequency || 0.001;
            this.amplitude = e.amplitude || 1;
        },
        update: function () {
            return (
                (this.phase += this.frequency),
                (e = this.offset + Math.sin(this.phase) * this.amplitude)
            );
        },
        value: function () {
            return e;
        },
    };

    function Line(e) {
        this.init(e || {});
    }

    Line.prototype = {
        init: function (e) {
            this.spring = e.spring + 0.1 * Math.random() - 0.02;
            this.friction = E.friction + 0.01 * Math.random() - 0.002;
            this.nodes = [];
            for (var t, n = 0; n < E.size; n++) {
                t = new Node();
                t.x = pos.x;
                t.y = pos.y;
                this.nodes.push(t);
            }
        },
        update: function () {
            let e = this.spring,
                t = this.nodes[0];
            t.vx += (pos.x - t.x) * e;
            t.vy += (pos.y - t.y) * e;
            for (var n, i = 0, a = this.nodes.length; i < a; i++)
                (t = this.nodes[i]),
                    0 < i &&
                    ((n = this.nodes[i - 1]),
                        (t.vx += (n.x - t.x) * e),
                        (t.vy += (n.y - t.y) * e),
                        (t.vx += n.vx * E.dampening),
                        (t.vy += n.vy * E.dampening)),
                    (t.vx *= this.friction),
                    (t.vy *= this.friction),
                    (t.x += t.vx),
                    (t.y += t.vy),
                    (e *= E.tension);
        },
        draw: function () {
            let e,
                t,
                n = this.nodes[0].x,
                i = this.nodes[0].y;
            ctx.beginPath();
            ctx.moveTo(n, i);
            for (var a = 1, o = this.nodes.length - 2; a < o; a++) {
                e = this.nodes[a];
                t = this.nodes[a + 1];
                n = 0.5 * (e.x + t.x);
                i = 0.5 * (e.y + t.y);
                ctx.quadraticCurveTo(e.x, e.y, n, i);
            }
            e = this.nodes[a];
            t = this.nodes[a + 1];
            ctx.quadraticCurveTo(e.x, e.y, t.x, t.y);
            ctx.stroke();
            ctx.closePath();
        },
    };

    function onMousemove(e) {
        if (!ctx.running) return;

        // Check if mouse is over the container
        const container = document.getElementById(containerId);
        let isOver = false;

        if (e.touches) {
            // logic for touch if needed, or stick to simpler mouse
            const x = e.touches[0].clientX;
            const y = e.touches[0].clientY;
            if (container) {
                const rect = container.getBoundingClientRect();
                isOver = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
            }
            if (isOver) {
                pos.x = x;
                pos.y = y;
            }
        } else {
            if (container) {
                const rect = container.getBoundingClientRect();
                isOver = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
            }
            if (isOver) {
                pos.x = e.clientX;
                pos.y = e.clientY;
            }
        }

        // Only "spawn" lines if we updated position (implies hover)
        // Actually the update loop uses `pos` which is global. 
        // And `lines` need to be re-initialized?
        // The original code calls `o()` and `c(e)` on first mousemove then removes listener.
        // Wait, the original code: 
        // document.removeEventListener('mousemove', onMousemove) -> REMOVES ITSELF!
        // Then adds `c` (mousemove) and `l` (touchstart).

        // We need to intercept `c` (mousemove handler) to only update `pos` if within bounds.
        // But `lines` update based on `pos`. If we stop updating `pos`, lines will converge to last known pos.
        // That is acceptable. Or we can hide the canvas when out?
        // User wants "only apply in sidebar".
        // I will modify `c` function logic below.
    }

    // Custom tracking that replaces the global listeners in original code
    function c(e) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const rect = container.getBoundingClientRect();

        let clientX, clientY;
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
            // e.preventDefault(); // Might interfere with scrolling
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        // If outside, maybe we can hide the trails or let them linger?
        // Let's check bounds.
        const isInside = clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;

        if (isInside) {
            pos.x = clientX;
            pos.y = clientY;
            ctx.canvas.style.opacity = '1';
        } else {
            // Optional: fade out
            ctx.canvas.style.opacity = '0';
        }
    }

    function render() {
        if (ctx.running) {
            ctx.globalCompositeOperation = 'source-over';
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.globalCompositeOperation = 'lighter';
            ctx.strokeStyle = 'hsla(' + Math.round(f.update()) + ',50%,50%,0.2)';
            ctx.lineWidth = 1;
            for (var e, t = 0; t < E.trails; t++) {
                (e = lines[t]).update();
                e.draw();
            }
            ctx.frame++;
            window.requestAnimationFrame(render);
        }
    }

    function resizeCanvas() {
        ctx.canvas.width = window.innerWidth;
        ctx.canvas.height = window.innerHeight;
    }

    var ctx,
        f,
        e = 0,
        pos = { x: 0, y: 0 },
        lines = [],
        E = {
            debug: true,
            friction: 0.5,
            trails: 20,
            size: 50,
            dampening: 0.25,
            tension: 0.98,
        };

    function Node() {
        this.x = 0;
        this.y = 0;
        this.vy = 0;
        this.vx = 0;
    }

    const renderCanvas = function () {
        const canvas = document.getElementById('canvas-cursor');
        if (!canvas) return;

        ctx = canvas.getContext('2d');
        ctx.running = true;
        ctx.frame = 1;

        // Initial pos off screen or center
        pos.x = window.innerWidth / 2;
        pos.y = window.innerHeight / 2;

        f = new n({
            phase: Math.random() * 2 * Math.PI,
            amplitude: 85,
            frequency: 0.0015,
            offset: 285,
        });

        // Initialize lines
        lines = [];
        for (let i = 0; i < E.trails; i++)
            lines.push(new Line({ spring: 0.4 + (i / E.trails) * 0.025 }));

        document.addEventListener('mousemove', c);
        document.addEventListener('touchmove', c); // Use touchmove instead of touchstart for tracking
        // document.addEventListener('touchstart', l); // simplified

        document.body.addEventListener('orientationchange', resizeCanvas);
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('focus', () => {
            if (!ctx.running) {
                ctx.running = true;
                render();
            }
        });
        window.addEventListener('blur', () => {
            ctx.running = true;
        });
        resizeCanvas();
        render();
    };

    useEffect(() => {
        renderCanvas();

        return () => {
            if (ctx) ctx.running = false;
            document.removeEventListener('mousemove', c);
            document.removeEventListener('touchmove', c);
            document.body.removeEventListener('orientationchange', resizeCanvas);
            window.removeEventListener('resize', resizeCanvas);
            // Remove other listeners if added
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useCanvasCursor;
